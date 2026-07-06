import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { auditLog } from '@/lib/audit';

function back(request: NextRequest, id: string, state: string) {
  return NextResponse.redirect(new URL(`/admin/products/${id}?image=${encodeURIComponent(state)}`, request.url));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const { id, imageId } = await params;
  const user = await requirePermission('products.manage');
  const { data: image } = await supabaseAdmin.from('product_images').select('id').eq('id', imageId).eq('product_id', id).single();
  if (!image) return back(request, id, 'image-not-found');

  await supabaseAdmin.from('product_images').update({ is_primary: false }).eq('product_id', id);
  const { error } = await supabaseAdmin.from('product_images').update({ is_primary: true }).eq('id', imageId).eq('product_id', id);
  if (error) return back(request, id, 'primary-failed');
  await auditLog(user.id, 'set_primary_image', 'products', id, { image_id: imageId });
  return back(request, id, 'primary-updated');
}
