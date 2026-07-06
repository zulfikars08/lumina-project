import Link from 'next/link';
import { deleteProduct, saveProduct } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function ProductsPage() {
  await requirePermission('products.manage');
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabaseAdmin.from('products').select('*,categories(name)').order('created_at', { ascending: false }),
    supabaseAdmin.from('categories').select('id,name').order('name'),
  ]);
  async function create(formData: FormData) {
    'use server';
    await saveProduct({
      name: String(formData.get('name') ?? ''), sku: String(formData.get('sku') ?? ''), category_id: String(formData.get('category_id') || '') || null,
      price: Number(formData.get('price') ?? 0), stock: Number(formData.get('stock') ?? 0), status: String(formData.get('status') ?? 'draft') as 'draft',
    });
  }
  async function remove(formData: FormData) { 'use server'; await deleteProduct(String(formData.get('id'))); }
  return <section><h1>Products</h1><form action={create}><input name="name" placeholder="Name" required /><input name="sku" placeholder="SKU" required /><select name="category_id"><option value="">No category</option>{categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input name="price" type="number" min="0" placeholder="Price" required /><input name="stock" type="number" min="0" placeholder="Stock" required /><select name="status"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select><button>Create</button></form><ul>{products?.map((item) => <li key={item.id}><Link href={`/admin/products/${item.id}`}>{item.name}</Link> — {item.status} — stock {item.stock} <form action={remove} style={{ display: 'inline' }}><input type="hidden" name="id" value={item.id} /><button>Delete</button></form></li>)}</ul></section>;
}
