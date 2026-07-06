import Link from 'next/link';
import { deleteCategory, saveCategory } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function CategoriesPage() {
  await requirePermission('categories.manage');
  const { data: categories } = await supabaseAdmin.from('categories').select('*').order('created_at', { ascending: false });
  async function create(formData: FormData) {
    'use server';
    await saveCategory({ name: String(formData.get('name') ?? ''), slug: String(formData.get('slug') ?? ''), description: String(formData.get('description') ?? '') });
  }
  async function remove(formData: FormData) {
    'use server';
    await deleteCategory(String(formData.get('id')));
  }
  return <section><h1>Categories</h1><form action={create}><input name="name" placeholder="Name" required /><input name="slug" placeholder="slug optional" /><textarea name="description" placeholder="Description" /><button>Create</button></form><ul>{categories?.map((item) => <li key={item.id}><Link href={`/admin/categories/${item.id}`}>{item.name}</Link> <form action={remove} style={{ display: 'inline' }}><input type="hidden" name="id" value={item.id} /><button>Delete</button></form></li>)}</ul></section>;
}
