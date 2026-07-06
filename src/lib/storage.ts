import 'server-only';

import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/rbac';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadAdminImage(bucket: 'products' | 'banners' | 'blog' | 'content', file: File, permission?: string) {
  await requirePermission(permission ?? (bucket === 'products' ? 'products.manage' : 'banners.manage'));
  if (!IMAGE_TYPES.has(file.type)) throw new Error('Only JPG, PNG, and WEBP images are allowed.');
  if (file.size > MAX_SIZE) throw new Error('Image must be 5MB or smaller.');
  const ext = file.name.split('.').pop() || 'webp';
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function deleteAdminImage(bucket: 'products' | 'banners' | 'blog' | 'content', path: string, permission?: string) {
  await requirePermission(permission ?? (bucket === 'products' ? 'products.manage' : 'banners.manage'));
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}
