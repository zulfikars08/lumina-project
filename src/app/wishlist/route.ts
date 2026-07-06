import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRouteUser } from '@/lib/auth/route-auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const user = await requireRouteUser(request);
  const form = await request.formData();
  const productId = z.string().uuid().parse(form.get('product_id'));
  const { data: product } = await supabaseAdmin.from('products').select('slug,status').eq('id', productId).single();
  if (!product || product.status !== 'active') return NextResponse.redirect(new URL('/products?wishlist=unavailable', request.url));
  await supabaseAdmin.from('wishlists').upsert({ user_id: user.id, product_id: productId });
  return NextResponse.redirect(new URL(`/products/${product.slug}?wishlist=added`, request.url));
}
