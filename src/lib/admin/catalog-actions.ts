'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/rbac';
import { auditLog } from '@/lib/audit';
import { slugify } from '@/lib/slug';
import { deleteAdminImage, uploadAdminImage } from '@/lib/storage';

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  description: z.string().optional(),
  image_path: z.string().optional(),
  is_active: z.boolean().default(true),
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  sku: z.string().trim().min(2),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  discount_price: z.coerce.number().min(0).nullable().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  stock: z.coerce.number().int().min(0).default(0),
  weight_grams: z.coerce.number().int().min(0).nullable().optional(),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  name: z.string().trim().min(1),
  sku: z.string().trim().min(2),
  option_values: z.record(z.string(), z.string()).default({}),
  price: z.coerce.number().min(0).nullable().optional(),
  discount_price: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

function dbError(error: { code?: string; message: string }): never {
  if (error.code === '23505') throw new Error('Duplicate slug or SKU. Use a unique value.');
  throw new Error(error.message);
}

export async function saveCategory(input: z.input<typeof categorySchema>) {
  const user = await requirePermission('categories.manage');
  const data = categorySchema.parse(input);
  const row = { ...data, slug: data.slug || slugify(data.name) };
  const result = data.id
    ? await supabaseAdmin.from('categories').update(row).eq('id', data.id).select('id').single()
    : await supabaseAdmin.from('categories').insert(row).select('id').single();
  if (result.error) dbError(result.error);
  await auditLog(user.id, data.id ? 'update' : 'create', 'categories', result.data.id, row);
  revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string) {
  const user = await requirePermission('categories.manage');
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
  if (error) dbError(error);
  await auditLog(user.id, 'delete', 'categories', id);
  revalidatePath('/admin/categories');
}

export async function uploadCategoryImage(categoryId: string, file: File) {
  const user = await requirePermission('categories.manage');
  const path = await uploadAdminImage('content', file, 'categories.manage');
  const { error } = await supabaseAdmin.from('categories').update({ image_path: path }).eq('id', categoryId);
  if (error) dbError(error);
  await auditLog(user.id, 'upload_image', 'categories', categoryId, { path });
  revalidatePath(`/admin/categories/${categoryId}`);
}

export async function saveProduct(input: z.input<typeof productSchema>) {
  const user = await requirePermission('products.manage');
  const data = productSchema.parse(input);
  const previous = data.id ? await supabaseAdmin.from('products').select('stock').eq('id', data.id).single() : null;
  const row = { ...data, slug: data.slug || slugify(data.name), has_variants: false };
  const result = data.id
    ? await supabaseAdmin.from('products').update(row).eq('id', data.id).select('id,stock').single()
    : await supabaseAdmin.from('products').insert(row).select('id,stock').single();
  if (result.error) dbError(result.error);
  const oldStock = previous?.data?.stock ?? 0;
  if (!data.id || oldStock !== data.stock) {
    await supabaseAdmin.from('inventory_logs').insert({ product_id: result.data.id, change_qty: data.stock - oldStock, reason: data.id ? 'admin_adjustment' : 'initial_stock', created_by: user.id });
  }
  await auditLog(user.id, data.id ? 'update' : 'create', 'products', result.data.id, row);
  revalidatePath('/admin/products');
}

export async function deleteProduct(id: string) {
  const user = await requirePermission('products.manage');
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) dbError(error);
  await auditLog(user.id, 'delete', 'products', id);
  revalidatePath('/admin/products');
}

export async function saveVariant(input: z.input<typeof variantSchema>) {
  const user = await requirePermission('products.manage');
  const data = variantSchema.parse(input);
  const previous = data.id ? await supabaseAdmin.from('product_variants').select('stock').eq('id', data.id).single() : null;
  const result = data.id
    ? await supabaseAdmin.from('product_variants').update(data).eq('id', data.id).select('id,stock,product_id').single()
    : await supabaseAdmin.from('product_variants').insert(data).select('id,stock,product_id').single();
  if (result.error) dbError(result.error);
  await supabaseAdmin.from('products').update({ has_variants: true }).eq('id', result.data.product_id);
  const oldStock = previous?.data?.stock ?? 0;
  if (!data.id || oldStock !== data.stock) {
    await supabaseAdmin.from('inventory_logs').insert({ variant_id: result.data.id, change_qty: data.stock - oldStock, reason: data.id ? 'admin_adjustment' : 'initial_stock', created_by: user.id });
  }
  await auditLog(user.id, data.id ? 'update' : 'create', 'product_variants', result.data.id, data);
  revalidatePath('/admin/variants');
}

export async function deleteVariant(id: string) {
  const user = await requirePermission('products.manage');
  const { error } = await supabaseAdmin.from('product_variants').delete().eq('id', id);
  if (error) dbError(error);
  await auditLog(user.id, 'delete', 'product_variants', id);
  revalidatePath('/admin/variants');
}

export async function uploadProductImage(productId: string, file: File, isPrimary = false) {
  const user = await requirePermission('products.manage');
  const path = await uploadAdminImage('products', file);
  if (isPrimary) await supabaseAdmin.from('product_images').update({ is_primary: false }).eq('product_id', productId);
  const { data, error } = await supabaseAdmin.from('product_images').insert({ product_id: productId, file_path: path, is_primary: isPrimary }).select('id').single();
  if (error) dbError(error);
  await auditLog(user.id, 'upload_image', 'products', productId, { image_id: data.id, path });
  revalidatePath(`/admin/products/${productId}`);
}

export async function setPrimaryProductImage(productId: string, imageId: string) {
  const user = await requirePermission('products.manage');
  await supabaseAdmin.from('product_images').update({ is_primary: false }).eq('product_id', productId);
  const { error } = await supabaseAdmin.from('product_images').update({ is_primary: true }).eq('id', imageId).eq('product_id', productId);
  if (error) dbError(error);
  await auditLog(user.id, 'set_primary_image', 'products', productId, { image_id: imageId });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(productId: string, imageId: string, path: string) {
  const user = await requirePermission('products.manage');
  await deleteAdminImage('products', path);
  const { error } = await supabaseAdmin.from('product_images').delete().eq('id', imageId).eq('product_id', productId);
  if (error) dbError(error);
  await auditLog(user.id, 'delete_image', 'products', productId, { image_id: imageId, path });
  revalidatePath(`/admin/products/${productId}`);
}

export async function replaceProductImage(productId: string, imageId: string, oldPath: string, file: File) {
  const user = await requirePermission('products.manage');
  const path = await uploadAdminImage('products', file);
  await deleteAdminImage('products', oldPath);
  const { error } = await supabaseAdmin.from('product_images').update({ file_path: path }).eq('id', imageId).eq('product_id', productId);
  if (error) dbError(error);
  await auditLog(user.id, 'replace_image', 'products', productId, { image_id: imageId, oldPath, path });
  revalidatePath(`/admin/products/${productId}`);
}
