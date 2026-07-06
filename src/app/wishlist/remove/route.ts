import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRouteUser } from '@/lib/auth/route-auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const user = await requireRouteUser(request);
  const form = await request.formData();
  const productId = z.string().uuid().parse(form.get('product_id'));
  await supabaseAdmin.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
  return NextResponse.redirect(new URL('/account/wishlist?wishlist=removed', request.url));
}
