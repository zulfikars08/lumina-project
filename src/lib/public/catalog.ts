import 'server-only';

import { supabaseAdmin } from '@/lib/supabase/server';

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  benefits: string | null;
  how_to_use: string | null;
  ingredients: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  created_at: string;
  category_id: string | null;
  categories: { name: string; slug: string } | null;
  product_images: Array<{ id: string; file_path: string; alt_text: string | null; is_primary: boolean; sort_order: number }>;
};

export function imageUrl(bucket: 'products' | 'banners' | 'blog' | 'content', path?: string | null) {
  if (!path) return null;
  return supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function getActiveCategories() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('id,name,slug,description,image_path')
    .eq('is_active', true)
    .order('sort_order')
    .order('name');
  return data ?? [];
}

export async function getActiveProducts({ search, category, sort = 'latest', limit = 24 }: { search?: string; category?: string; sort?: string; limit?: number } = {}) {
  let query = supabaseAdmin
    .from('products')
    .select('id,name,slug,sku,short_description,description,benefits,how_to_use,ingredients,price,discount_price,stock,created_at,category_id,categories(name,slug),product_images(id,file_path,alt_text,is_primary,sort_order)')
    .eq('status', 'active')
    .limit(limit);

  if (search) query = query.ilike('name', `%${search}%`);
  if (category) query = query.eq('categories.slug', category);
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else if (sort === 'name_asc') query = query.order('name', { ascending: true });
  else query = query.order('created_at', { ascending: false });

  const { data } = await query;
  return (data ?? []) as unknown as PublicProduct[];
}

export async function getProductBySlug(slug: string) {
  const { data } = await supabaseAdmin
    .from('products')
    .select('id,name,slug,sku,short_description,description,benefits,how_to_use,ingredients,price,discount_price,stock,created_at,category_id,categories(name,slug),product_images(id,file_path,alt_text,is_primary,sort_order),product_variants(id,name,sku,option_values,price,discount_price,stock,is_active)')
    .eq('status', 'active')
    .eq('slug', slug)
    .single();
  return data;
}

export async function getRelatedProducts(categoryId: string | null, productId: string) {
  if (!categoryId) return [];
  const { data } = await supabaseAdmin
    .from('products')
    .select('id,name,slug,price,discount_price,categories(name,slug),product_images(id,file_path,alt_text,is_primary,sort_order)')
    .eq('status', 'active')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .limit(4);
  return data ?? [];
}
