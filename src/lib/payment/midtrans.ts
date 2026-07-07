import 'server-only';

import { createHash } from 'crypto';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';

const snapBase = env.midtransIsProduction ? 'https://app.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1';
const apiBase = env.midtransIsProduction ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2';

type MidtransStatus = { transaction_status?: string; fraud_status?: string; status_code?: string; gross_amount?: string; order_id?: string; signature_key?: string };

type ReceiptOrder = {
  id: string;
  order_number: string;
  grand_total: number;
  shipping_address: { recipient_name?: string; phone?: string; full_address?: string; district?: string; city?: string; province?: string; postal_code?: string };
  users?: { email?: string; name?: string } | null;
  order_items?: Array<{ product_name: string; variant_name: string | null; sku: string; quantity: number; total_price: number }>;
};

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
  const previous = payment.status as string;
  const alreadyPaid = previous === 'PAID';
  const paymentStatus = alreadyPaid && !refunded ? 'PAID' : paid ? 'PAID' : expired ? 'EXPIRED' : failed ? 'FAILED' : refunded ? 'REFUNDED' : 'PENDING';
  const orderStatus = alreadyPaid && !refunded ? 'PAID' : paid ? 'PAID' : expired ? 'EXPIRED' : failed ? 'CANCELLED' : refunded ? 'REFUNDED' : 'PENDING_PAYMENT';
  const raw = { ...(typeof payment.raw_response === 'object' && payment.raw_response ? payment.raw_response : {}), midtrans: body };
  await supabaseAdmin.from('payments').update({ status: paymentStatus, raw_response: raw, paid_at: paid && !payment.paid_at ? new Date().toISOString() : payment.paid_at }).eq('id', payment.id);
  await supabaseAdmin.from('orders').update({ status: orderStatus }).eq('id', payment.order_id);
  if ((expired || failed) && !['EXPIRED', 'FAILED', 'PAID', 'REFUNDED'].includes(previous)) await restoreStock(payment.order_id);
  if (paymentStatus === 'PAID' && previous !== 'PAID') await sendReceiptEmailOnce(payment.id, payment.order_id, raw);
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

async function sendReceiptEmailOnce(paymentId: string, orderId: string, raw: Record<string, unknown>) {
  if (raw.receipt_email_sent_at) return;
  if (!env.resendApiKey || !env.emailFrom) {
    console.warn('Receipt email skipped: missing RESEND_API_KEY or EMAIL_FROM');
    return;
  }
  const { data: order } = await supabaseAdmin.from('orders').select('id,order_number,grand_total,shipping_address,users(email,name),order_items(product_name,variant_name,sku,quantity,total_price)').eq('id', orderId).single<ReceiptOrder>();
  const to = order?.users?.email;
  if (!order || !to) {
    console.warn('Receipt email skipped: missing order/customer email', { orderId });
    return;
  }
  const address = order.shipping_address ?? {};
  const items = (order.order_items ?? []).map((item) => `<li>${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''} — ${item.quantity} × ${item.sku} — Rp ${Number(item.total_price).toLocaleString('id-ID')}</li>`).join('');
  const html = `<h1>Payment received</h1><p>Order ${order.order_number}</p><p>Customer: ${order.users?.name ?? to}</p><p>Status: PAID</p><ul>${items}</ul><p>Total paid: Rp ${Number(order.grand_total).toLocaleString('id-ID')}</p><p>Ship to: ${address.recipient_name ?? ''}, ${address.full_address ?? ''}, ${address.district ?? ''}, ${address.city ?? ''}, ${address.province ?? ''} ${address.postal_code ?? ''}</p>`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: env.emailFrom, to, subject: `Lumina receipt ${order.order_number}`, html }) });
  if (!response.ok) {
    console.error('Receipt email failed', { orderId, status: response.status, body: await response.text() });
    return;
  }
  await supabaseAdmin.from('payments').update({ raw_response: { ...raw, receipt_email_sent_at: new Date().toISOString() } }).eq('id', paymentId);
}
