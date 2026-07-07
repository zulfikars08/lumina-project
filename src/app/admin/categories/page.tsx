import Link from 'next/link';
import { deleteCategory, saveCategory } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Button, Card, EmptyState, Field, PageHeader, StatusBadge, TableShell } from '@/components/ui';

export default async function CategoriesPage() {
  await requirePermission('categories.manage');
  const { data: categories } = await supabaseAdmin.from('categories').select('*').order('created_at', { ascending: false });
  async function create(formData: FormData) { 'use server'; await saveCategory({ name: String(formData.get('name') ?? ''), slug: String(formData.get('slug') ?? ''), description: String(formData.get('description') ?? '') }); }
  async function remove(formData: FormData) { 'use server'; await deleteCategory(String(formData.get('id'))); }
  return <div className="space-y-6"><PageHeader eyebrow="Admin catalog" title="Categories" description="Organize products into clear storefront collections." /><Card><h2 className="text-xl font-semibold theme-heading">Create category</h2><form action={create} className="mt-4 grid gap-3 md:grid-cols-2"><Field label="Name"><input name="name" required /></Field><Field label="Slug"><input name="slug" placeholder="optional" /></Field><Field label="Description"><textarea name="description" placeholder="Description" /></Field><Button className="self-end">Create category</Button></form></Card>{categories?.length ? <TableShell><table><thead><tr><th>Category</th><th>Status</th><th>Description</th><th>Actions</th></tr></thead><tbody>{categories.map((item) => <tr key={item.id}><td><Link className="font-medium theme-heading" href={`/admin/categories/${item.id}`}>{item.name}</Link><p className="text-sm theme-text-muted">{item.slug}</p></td><td><StatusBadge status={item.is_active ? 'active' : 'draft'} /></td><td className="max-w-md">{item.description ?? <span className="theme-text-muted">No description</span>}</td><td><div className="flex flex-wrap gap-2"><Link className="theme-brand" href={`/admin/categories/${item.id}`}>Edit</Link><form action={remove}><input type="hidden" name="id" value={item.id} /><button className="theme-text-muted">Delete</button></form></div></td></tr>)}</tbody></table></TableShell> : <EmptyState icon="✦" title="No categories yet" description="Create category groups for storefront browsing." />}</div>;
}
