import { saveCategory, uploadCategoryImage } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('categories.manage');
  const { id } = await params;
  const { data: category } = await supabaseAdmin.from('categories').select('*').eq('id', id).single();
  if (!category) return <h1>Category not found</h1>;
  async function update(formData: FormData) {
    'use server';
    await saveCategory({ id, name: String(formData.get('name') ?? ''), slug: String(formData.get('slug') ?? ''), description: String(formData.get('description') ?? ''), image_path: String(formData.get('image_path') ?? ''), is_active: formData.get('is_active') === 'on' });
  }
  async function upload(formData: FormData) {
    'use server';
    const file = formData.get('image');
    if (file instanceof File && file.size > 0) await uploadCategoryImage(id, file);
  }
  return <section><h1>Edit category</h1><form action={update}><input name="name" defaultValue={category.name} required /><input name="slug" defaultValue={category.slug} required /><textarea name="description" defaultValue={category.description ?? ''} /><input name="image_path" defaultValue={category.image_path ?? ''} /><label><input name="is_active" type="checkbox" defaultChecked={category.is_active} /> Active</label><button>Save</button></form><form action={upload}><input name="image" type="file" accept="image/png,image/jpeg,image/webp" required /><button>Upload image</button></form>{category.image_path ? <p>Image: {category.image_path}</p> : null}</section>;
}
