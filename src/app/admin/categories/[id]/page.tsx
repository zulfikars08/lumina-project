import { saveCategory, uploadCategoryImage } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Button, Card, EmptyState, Field, PageHeader, StatusBadge } from '@/components/ui';

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('categories.manage');
  const { id } = await params;
  const { data: category } = await supabaseAdmin.from('categories').select('*').eq('id', id).single();
  if (!category) return <EmptyState icon="☾" title="Category not found" />;
  async function update(formData: FormData) { 'use server'; await saveCategory({ id, name: String(formData.get('name') ?? ''), slug: String(formData.get('slug') ?? ''), description: String(formData.get('description') ?? ''), image_path: String(formData.get('image_path') ?? ''), is_active: formData.get('is_active') === 'on' }); }
  async function upload(formData: FormData) { 'use server'; const file = formData.get('image'); if (file instanceof File && file.size > 0) await uploadCategoryImage(id, file); }
  return <div className="space-y-6"><PageHeader eyebrow="Category editor" title={category.name} description="Edit category copy, status, and image reference." action={<StatusBadge status={category.is_active ? 'active' : 'draft'} />} /><Card><form action={update} className="grid gap-3 md:grid-cols-2"><Field label="Name"><input name="name" defaultValue={category.name} required /></Field><Field label="Slug"><input name="slug" defaultValue={category.slug} required /></Field><Field label="Description"><textarea name="description" defaultValue={category.description ?? ''} /></Field><Field label="Image path"><input name="image_path" defaultValue={category.image_path ?? ''} /></Field><label className="flex items-center gap-2 text-sm theme-text"><input name="is_active" type="checkbox" defaultChecked={category.is_active} /> Active</label><Button className="md:col-span-2">Save category</Button></form></Card><Card><h2 className="text-xl font-semibold theme-heading">Category image</h2><form action={upload} className="mt-4 flex flex-wrap items-end gap-3"><Field label="Upload image"><input name="image" type="file" accept="image/png,image/jpeg,image/webp" required /></Field><Button>Upload image</Button></form>{category.image_path ? <p className="mt-3 text-sm theme-text-muted">Current: {category.image_path}</p> : <div className="mt-4"><EmptyState icon="✦" title="No category image" description="Upload or keep text-only category display." /></div>}</Card></div>;
}
