import 'server-only';

import { createHash } from 'crypto';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';

const snapBase = env.midtransIsProduction ? 'https://app.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1';
const apiBase = env.midtransIsProduction ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2';

type MidtransStatus = { transaction_status?: string; fraud_status?: string; status_code?: string; gross_amount?: string; order_id?: string; signature_key?: string };

function auth() {
  if (!env.midtransServerKey) throw new Error('Missing MIDTRANS_SERVER_KEY');
  return `Basic ${Buffer.from(`${env.midtransServerKey}:`).toString('base64')}`;
}

export function verifySignature(body: MidtransStatus) {
  const expected = createHash('sha512').update(`${body.order_id}${body.status_code}${body.gross_amount}${env.midtransServerKey}`).digest('hex');
  return body.signature_key === expected;
}

export async function createSnapTransaction(orderId: string) {
  const { data: order, error } = await supabaseAdmin.from('orders').select('*,users(email,name),order_items(*)').eq('id', orderId).single();
  if (error || !order) throw new Error(error?.message ?? 'Order not found');
  const address = order.shipping_address as { recipient_name?: string; phone?: string; full_address?: string; city?: string; postal_code?: string };
  const providerOrderId = `MID-${order.order_number}`;
  const payload = {
    transaction_details: { order_id: providerOrderId, gross_amount: Math.round(Number(order.grand_total)) },
    item_details: [
      ...(order.order_items ?? []).map((item: { sku: string; product_name: string; quantity: number; unit_price: number }) => ({ id: item.sku, name: item.product_name.slice(0, 50), quantity: item.quantity, price: Math.round(Number(item.unit_price)) })),
      ...(Number(order.discount_total) > 0 ? [{ id: 'DISCOUNT', name: 'Discount', quantity: 1, price: -Math.round(Number(order.discount_total)) }] : []),
    ],
    customer_details: { first_name: address.recipient_name ?? order.users?.name, email: order.users?.email, phone: address.phone, shipping_address: { first_name: address.recipient_name, phone: address.phone, address: address.full_address, city: address.city, postal_code: address.postal_code } },
    callbacks: { finish: `${env.appUrl}/account/orders/${order.id}` },
    notification_url: env.midtransNotificationUrl || undefined,
  };
  const response = await fetch(`${snapBase}/transactions`, { method: 'POST', headers: { Authorization: auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error_messages?.join(', ') ?? 'Midtrans Snap error');
  return { providerOrderId, token: json.token as string, redirectUrl: json.redirect_url as string, raw: json };
}

export async function getMidtransStatus(providerOrderId: string) {
  const response = await fetch(`${apiBase}/${encodeURIComponent(providerOrderId)}/status`, { headers: { Authorization: auth() } });
  const json = await response.json();
  if (!response.ok) throw new Error(json.status_message ?? 'Midtrans status error');
  return json as MidtransStatus;
}

export async function applyMidtransStatus(body: MidtransStatus) {
  const providerOrderId = body.order_id;
  if (!providerOrderId) throw new Error('Missing order_id');
  const { data: payment } = await supabaseAdmin.from('payments').select('*,orders(*)').eq('provider_order_id', providerOrderId).maybeSingle();
  if (!payment) throw new Error('Payment not found');
  const status = body.transaction_status;
  const fraud = body.fraud_status;
  const paid = status === 'settlement' || (status === 'capture' && fraud !== 'deny');
  const expired = status === 'expire';
  const failed = ['cancel', 'deny', 'failure'].includes(status ?? '');
  const refunded = status === 'refund';
  const paymentStatus = paid ? 'PAID' : expired ? 'EXPIRED' : failed ? 'FAILED' : refunded ? 'REFUNDED' : 'PENDING';
  const orderStatus = paid ? 'PAID' : expired ? 'EXPIRED' : failed ? 'CANCELLED' : refunded ? 'REFUNDED' : 'PENDING_PAYMENT';
  const previous = payment.status;
  await supabaseAdmin.from('payments').update({ status: paymentStatus, raw_response: body, paid_at: paid ? new Date().toISOString() : payment.paid_at }).eq('id', payment.id);
  await supabaseAdmin.from('orders').update({ status: orderStatus }).eq('id', payment.order_id);
  if ((expired || failed) && !['EXPIRED', 'FAILED'].includes(previous)) await restoreStock(payment.order_id);
  return { paymentStatus, orderStatus };
}

async function restoreStock(orderId: string) {
  const { count } = await supabaseAdmin.from('inventory_logs').select('id', { count: 'exact', head: true }).eq('reference_id', orderId).eq('reason', 'ORDER_CANCELLED_RESTORE');
  if ((count ?? 0) > 0) return;
  const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', orderId);
  for (const item of items ?? []) {
    if (item.variant_id) {
      const { data: variant } = await supabaseAdmin.from('product_variants').select('stock').eq('id', item.variant_id).single();
      await supabaseAdmin.from('product_variants').update({ stock: (variant?.stock ?? 0) + item.quantity }).eq('id', item.variant_id);
    } else if (item.product_id) {
      const { data: product } = await supabaseAdmin.from('products').select('stock').eq('id', item.product_id).single();
      await supabaseAdmin.from('products').update({ stock: (product?.stock ?? 0) + item.quantity }).eq('id', item.product_id);
    }
    await supabaseAdmin.from('inventory_logs').insert({ product_id: item.product_id, variant_id: item.variant_id, change_qty: item.quantity, reason: 'ORDER_CANCELLED_RESTORE', reference_type: 'orders', reference_id: orderId });
  }
}
