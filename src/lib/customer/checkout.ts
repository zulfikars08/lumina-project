'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

const addressSchema = z.object({
  recipient_name: z.string().trim().min(2),
  phone: z.string().trim().regex(/^[0-9+ -]{8,20}$/),
  province: z.string().trim().min(2),
  city: z.string().trim().min(2),
  district: z.string().trim().min(2),
  postal_code: z.string().trim().regex(/^[0-9]{4,10}$/),
  full_address: z.string().trim().min(8),
  notes: z.string().optional(),
});

type CartItem = {
  id: string;
  quantity: number;
  products: { id: string; name: string; sku: string; status: string; price: number; discount_price: number | null; stock: number; category_id: string | null; product_images?: Array<{ file_path: string; is_primary: boolean; sort_order: number }> } | Array<{ id: string; name: string; sku: string; status: string; price: number; discount_price: number | null; stock: number; category_id: string | null; product_images?: Array<{ file_path: string; is_primary: boolean; sort_order: number }> }> | null;
  product_variants: { id: string; name: string; sku: string; option_values: Record<string, unknown>; price: number | null; discount_price: number | null; stock: number; is_active: boolean } | Array<{ id: string; name: string; sku: string; option_values: Record<string, unknown>; price: number | null; discount_price: number | null; stock: number; is_active: boolean }> | null;
};

type VoucherResult = { voucherId: string | null; code: string; discount: number; error?: string };

function one<T>(value: T | T[] | null | undefined) { return Array.isArray(value) ? value[0] : value; }
function money(value: unknown) { return Number(value ?? 0); }

async function cartRows(userId: string) {
  const { data: cart } = await supabaseAdmin.from('carts').select('id').eq('user_id', userId).maybeSingle();
  if (!cart) return { cart: null, items: [] as CartItem[] };
  const { data: items } = await supabaseAdmin
    .from('cart_items')
    .select('id,quantity,products(id,name,sku,status,price,discount_price,stock,category_id,product_images(file_path,is_primary,sort_order)),product_variants(id,name,sku,option_values,price,discount_price,stock,is_active)')
    .eq('cart_id', cart.id);
  return { cart, items: (items ?? []) as unknown as CartItem[] };
}

function totals(items: CartItem[]) {
  const lines = items.map((item) => {
    const product = one(item.products)!;
    const variant = one(item.product_variants);
    const price = money(variant?.discount_price ?? variant?.price ?? product.discount_price ?? product.price);
    return { item, product, variant, price, total: price * item.quantity };
  });
  return { lines, subtotal: lines.reduce((sum, line) => sum + line.total, 0) };
}

export async function validateCheckoutVoucher(userId: string, subtotal: number, items: CartItem[], code?: string | null): Promise<VoucherResult> {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (!normalized) return { voucherId: null, code: '', discount: 0 };
  const { data: voucher } = await supabaseAdmin.from('vouchers').select('*').eq('code', normalized).maybeSingle();
  const now = Date.now();
  if (!voucher || !voucher.is_active || new Date(voucher.starts_at).getTime() > now || new Date(voucher.ends_at).getTime() < now) return { voucherId: null, code: normalized, discount: 0, error: 'Voucher is invalid or expired.' };
  if (subtotal < money(voucher.minimum_purchase)) return { voucherId: null, code: normalized, discount: 0, error: 'Minimum purchase not reached.' };
  if (voucher.usage_limit) {
    const { count } = await supabaseAdmin.from('voucher_usages').select('id', { count: 'exact', head: true }).eq('voucher_id', voucher.id);
    if ((count ?? 0) >= voucher.usage_limit) return { voucherId: null, code: normalized, discount: 0, error: 'Voucher usage limit reached.' };
  }
  if (voucher.per_customer_usage_limit) {
    const { count } = await supabaseAdmin.from('voucher_usages').select('id', { count: 'exact', head: true }).eq('voucher_id', voucher.id).eq('user_id', userId);
    if ((count ?? 0) >= voucher.per_customer_usage_limit) return { voucherId: null, code: normalized, discount: 0, error: 'Voucher already used.' };
  }
  const productIds = voucher.product_ids as string[];
  const categoryIds = voucher.category_ids as string[];
  if (productIds?.length || categoryIds?.length) {
    const ok = items.some((item) => {
      const product = one(item.products)!;
      return productIds?.includes(product.id) || (product.category_id && categoryIds?.includes(product.category_id));
    });
    if (!ok) return { voucherId: null, code: normalized, discount: 0, error: 'Voucher does not apply to these products.' };
  }
  const raw = voucher.type === 'percentage' ? subtotal * (money(voucher.value) / 100) : money(voucher.value);
  return { voucherId: voucher.id, code: normalized, discount: Math.min(subtotal, Math.max(0, raw)) };
}

export async function applyCheckoutVoucher(formData: FormData) {
  const code = String(formData.get('voucher_code') ?? '').trim().toUpperCase();
  redirect(`/checkout${code ? `?voucher=${encodeURIComponent(code)}` : ''}`);
}

export async function createCheckoutAddress(formData: FormData) {
  const user = await requireUser();
  const data = addressSchema.parse({ recipient_name: formData.get('recipient_name'), phone: formData.get('phone'), province: formData.get('province'), city: formData.get('city'), district: formData.get('district'), postal_code: formData.get('postal_code'), full_address: formData.get('full_address'), notes: String(formData.get('notes') ?? '') });
  await supabaseAdmin.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  await supabaseAdmin.from('addresses').insert({ ...data, user_id: user.id, is_default: true });
  redirect('/checkout');
}

export async function placeOrder(formData: FormData) {
  const user = await requireUser();
  const voucherCode = String(formData.get('voucher_code') ?? '');
  const { cart, items } = await cartRows(user.id);
  if (!cart || !items.length) redirect('/account/cart?error=empty');
  const { data: address } = await supabaseAdmin.from('addresses').select('*').eq('user_id', user.id).eq('is_default', true).maybeSingle();
  if (!address) redirect('/checkout?error=address');
  const { lines, subtotal } = totals(items);
  for (const line of lines) {
    if (line.product.status !== 'active') redirect('/checkout?error=unavailable');
    const stock = line.variant ? line.variant.stock : line.product.stock;
    if (line.variant && !line.variant.is_active) redirect('/checkout?error=unavailable');
    if (line.item.quantity > stock) redirect('/checkout?error=stock');
  }
  const voucher = await validateCheckoutVoucher(user.id, subtotal, items, voucherCode);
  if (voucher.error) redirect(`/checkout?voucher=${encodeURIComponent(voucher.code)}&error=voucher`);
  const shipping = 0;
  const grand = subtotal - voucher.discount + shipping;
  const orderNumber = `LUM-${Date.now()}`;
  const { data: order, error } = await supabaseAdmin.from('orders').insert({ order_number: orderNumber, user_id: user.id, status: 'PENDING_PAYMENT', subtotal, discount_total: voucher.discount, shipping_fee: shipping, grand_total: grand, voucher_id: voucher.voucherId, shipping_address: address }).select('id,order_number,created_at').single();
  if (error || !order) throw new Error(error?.message ?? 'Unable to create order.');
  await supabaseAdmin.from('order_items').insert(lines.map((line) => ({ order_id: order.id, product_id: line.product.id, variant_id: line.variant?.id ?? null, product_name: line.product.name, variant_name: line.variant?.name ?? null, sku: line.variant?.sku ?? line.product.sku, quantity: line.item.quantity, unit_price: line.price, total_price: line.total })));
  for (const line of lines) {
    if (line.variant) await supabaseAdmin.from('product_variants').update({ stock: line.variant.stock - line.item.quantity }).eq('id', line.variant.id);
    else await supabaseAdmin.from('products').update({ stock: line.product.stock - line.item.quantity }).eq('id', line.product.id);
    await supabaseAdmin.from('inventory_logs').insert({ product_id: line.product.id, variant_id: line.variant?.id ?? null, change_qty: -line.item.quantity, reason: 'ORDER_CREATED', reference_type: 'orders', reference_id: order.id, created_by: user.id });
  }
  if (voucher.voucherId) await supabaseAdmin.from('voucher_usages').insert({ voucher_id: voucher.voucherId, user_id: user.id, order_id: order.id });
  await supabaseAdmin.from('invoices').insert({ order_id: order.id, invoice_number: `INV-${order.order_number}`, snapshot: { store: 'Lumina', customer: { name: user.name, email: user.email }, shipping_address: address, items: lines.map((line) => ({ product_name: line.product.name, variant_name: line.variant?.name, sku: line.variant?.sku ?? line.product.sku, price: line.price, quantity: line.item.quantity, subtotal: line.total })), subtotal, discount: voucher.discount, shipping_fee: shipping, grand_total: grand, order_date: order.created_at, status: 'PENDING_PAYMENT' } });
  await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);
  redirect(`/account/orders/${order.id}`);
}

export async function checkoutData(voucherCode?: string) {
  const user = await requireUser();
  const { items } = await cartRows(user.id);
  const { lines, subtotal } = totals(items);
  const { data: address } = await supabaseAdmin.from('addresses').select('*').eq('user_id', user.id).eq('is_default', true).maybeSingle();
  const voucher = await validateCheckoutVoucher(user.id, subtotal, items, voucherCode);
  return { user, items: lines, subtotal, address, voucher, shipping: 0, grandTotal: subtotal - (voucher.error ? 0 : voucher.discount) };
}
