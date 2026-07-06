import { NextRequest, NextResponse } from 'next/server';
import { uploadAdminImage } from '@/lib/storage';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { auditLog } from '@/lib/audit';

function back(id: string, state: string) {
  return NextResponse.redirect(new URL(`/admin/products/${id}?image=${encodeURIComponent(state)}`, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermission('products.manage');
  const formData = await request.formData();
  const file = formData.get('image');

  if (!(file instanceof File) || file.size === 0) return back(id, 'missing-file');

  try {
    const { count } = await supabaseAdmin.from('product_images').select('id', { count: 'exact', head: true }).eq('product_id', id);
    const isPrimary = count === 0 || formData.get('is_primary') === 'on';
    const path = await uploadAdminImage('products', file);
    if (isPrimary) await supabaseAdmin.from('product_images').update({ is_primary: false }).eq('product_id', id);
    const { data, error } = await supabaseAdmin
      .from('product_images')
      .insert({ product_id: id, file_path: path, is_primary: isPrimary })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    await auditLog(user.id, 'upload_image', 'products', id, { image_id: data.id, path });
    return back(id, 'uploaded');
  } catch (error) {
    console.error(error);
    return back(id, 'upload-failed');
  }
}
