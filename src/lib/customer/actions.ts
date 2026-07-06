'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

const addressSchema = z.object({
  id: z.string().uuid().optional(),
  recipient_name: z.string().trim().min(2),
  phone: z.string().trim().regex(/^[0-9+ -]{8,20}$/, 'Invalid phone number.'),
  province: z.string().trim().min(2),
  city: z.string().trim().min(2),
  district: z.string().trim().min(2),
  postal_code: z.string().trim().regex(/^[0-9]{4,10}$/, 'Invalid postal code.'),
  full_address: z.string().trim().min(8),
  notes: z.string().optional(),
  is_default: z.boolean().default(false),
});

async function cartId(userId: string) {
  const existing = await supabaseAdmin.from('carts').select('id').eq('user_id', userId).maybeSingle();
  if (existing.data) return existing.data.id;
  const { data, error } = await supabaseAdmin.from('carts').insert({ user_id: userId }).select('id').single();
  if (error || !data) throw new Error(error?.message ?? 'Unable to create cart.');
  return data.id;
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const name = z.string().trim().min(2).max(120).parse(formData.get('name'));
  await supabaseAdmin.from('users').update({ name, updated_at: new Date().toISOString() }).eq('id', user.id);
  revalidatePath('/account/profile');
  redirect('/account/profile?status=profile-updated');
}

export async function saveAddress(formData: FormData) {
  const user = await requireUser();
  const data = addressSchema.parse({
    id: String(formData.get('id') || '') || undefined,
    recipient_name: formData.get('recipient_name'), phone: formData.get('phone'), province: formData.get('province'), city: formData.get('city'), district: formData.get('district'), postal_code: formData.get('postal_code'), full_address: formData.get('full_address'), notes: String(formData.get('notes') ?? ''), is_default: formData.get('is_default') === 'on',
  });
  const { count } = await supabaseAdmin.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
  const { data: previous } = data.id ? await supabaseAdmin.from('addresses').select('is_default').eq('id', data.id).eq('user_id', user.id).single() : { data: null };
  const makeDefault = data.is_default || count === 0 || previous?.is_default === true;
  if (makeDefault) await supabaseAdmin.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  const row = { ...data, is_default: makeDefault, user_id: user.id };
  const result = data.id ? await supabaseAdmin.from('addresses').update(row).eq('id', data.id).eq('user_id', user.id) : await supabaseAdmin.from('addresses').insert(row);
  if (result.error) throw new Error(result.error.message);
  revalidatePath('/account/addresses');
  redirect('/account/addresses?status=saved');
}

export async function deleteAddress(formData: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().parse(formData.get('id'));
  await supabaseAdmin.from('addresses').delete().eq('id', id).eq('user_id', user.id);
  const { data } = await supabaseAdmin.from('addresses').select('id,is_default').eq('user_id', user.id).order('created_at');
  if (data?.length && !data.some((item) => item.is_default)) await supabaseAdmin.from('addresses').update({ is_default: true }).eq('id', data[0].id);
  revalidatePath('/account/addresses');
}

export async function setDefaultAddress(formData: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().parse(formData.get('id'));
  await supabaseAdmin.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  await supabaseAdmin.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user.id);
  revalidatePath('/account/addresses');
}

export async function toggleWishlist(formData: FormData) {
  const user = await requireUser();
  const product_id = z.string().uuid().parse(formData.get('product_id'));
  const next = String(formData.get('next') ?? 'add');
  if (next === 'remove') await supabaseAdmin.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product_id);
  else await supabaseAdmin.from('wishlists').upsert({ user_id: user.id, product_id });
  revalidatePath('/account/wishlist');
}

export async function addToCart(formData: FormData) {
  const user = await requireUser();
  const product_id = z.string().uuid().parse(formData.get('product_id'));
  const variant_id = String(formData.get('variant_id') || '') || null;
  const quantity = z.coerce.number().int().min(1).parse(formData.get('quantity') ?? 1);
  const { data: product } = await supabaseAdmin.from('products').select('id,status,stock').eq('id', product_id).single();
  if (!product || product.status !== 'active') throw new Error('Product is not available.');
  let stock = product.stock;
  if (variant_id) {
    const { data: variant } = await supabaseAdmin.from('product_variants').select('id,stock,is_active').eq('id', variant_id).eq('product_id', product_id).single();
    if (!variant?.is_active) throw new Error('Variant is not available.');
    stock = variant.stock;
  }
  if (quantity > stock) throw new Error('Requested quantity exceeds available stock.');
  const cart_id = await cartId(user.id);
  const existing = await supabaseAdmin.from('cart_items').select('id,quantity').eq('cart_id', cart_id).eq('product_id', product_id).eq('variant_id', variant_id).maybeSingle();
  const nextQty = (existing.data?.quantity ?? 0) + quantity;
  if (nextQty > stock) throw new Error('Requested quantity exceeds available stock.');
  if (existing.data) await supabaseAdmin.from('cart_items').update({ quantity: nextQty }).eq('id', existing.data.id);
  else await supabaseAdmin.from('cart_items').insert({ cart_id, product_id, variant_id, quantity });
  revalidatePath('/account/cart');
  redirect('/account/cart?status=added');
}

export async function updateCartQuantity(formData: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().parse(formData.get('id'));
  const quantity = z.coerce.number().int().min(1).parse(formData.get('quantity'));
  const cart_id = await cartId(user.id);
  const { data: item } = await supabaseAdmin.from('cart_items').select('id,product_id,variant_id,products(stock),product_variants(stock)').eq('id', id).eq('cart_id', cart_id).single();
  const product = Array.isArray(item?.products) ? item.products[0] : item?.products;
  const variant = Array.isArray(item?.product_variants) ? item.product_variants[0] : item?.product_variants;
  const stock = variant?.stock ?? product?.stock ?? 0;
  if (quantity > stock) redirect('/account/cart?error=stock');
  await supabaseAdmin.from('cart_items').update({ quantity }).eq('id', id).eq('cart_id', cart_id);
  revalidatePath('/account/cart');
}

export async function removeCartItem(formData: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().parse(formData.get('id'));
  const cart_id = await cartId(user.id);
  await supabaseAdmin.from('cart_items').delete().eq('id', id).eq('cart_id', cart_id);
  revalidatePath('/account/cart');
}

export async function clearCart() {
  const user = await requireUser();
  const cart_id = await cartId(user.id);
  await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart_id);
  revalidatePath('/account/cart');
}
