import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminImage } from '@/lib/storage';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { auditLog } from '@/lib/audit';

function back(request: NextRequest, id: string, state: string) {
  return NextResponse.redirect(new URL(`/admin/products/${id}?image=${encodeURIComponent(state)}`, request.url));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const { id, imageId } = await params;
  const user = await requirePermission('products.manage');
  const { data: image, error } = await supabaseAdmin.from('product_images').select('id,file_path,is_primary').eq('id', imageId).eq('product_id', id).single();
  if (error || !image) return back(request, id, 'image-not-found');

  try {
    await deleteAdminImage('products', image.file_path);
    const { error: deleteError } = await supabaseAdmin.from('product_images').delete().eq('id', imageId).eq('product_id', id);
    if (deleteError) throw new Error(deleteError.message);

    if (image.is_primary) {
      const { data: nextImage } = await supabaseAdmin.from('product_images').select('id').eq('product_id', id).order('sort_order').limit(1).maybeSingle();
      if (nextImage) await supabaseAdmin.from('product_images').update({ is_primary: true }).eq('id', nextImage.id);
    }

    await auditLog(user.id, 'delete_image', 'products', id, { image_id: imageId, path: image.file_path });
    return back(request, id, 'deleted');
  } catch (error) {
    console.error(error);
    return back(request, id, 'delete-failed');
  }
}

export const DELETE = POST;
