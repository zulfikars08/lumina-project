import Link from 'next/link';
import { deleteProduct, saveProduct } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Badge, Button, Card, EmptyState, Field, PageHeader, StatusBadge, TableShell } from '@/components/ui';

export default async function ProductsPage() {
  await requirePermission('products.manage');
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabaseAdmin.from('products').select('*,categories(name)').order('created_at', { ascending: false }),
    supabaseAdmin.from('categories').select('id,name').order('name'),
  ]);
  async function create(formData: FormData) {
    'use server';
    await saveProduct({ name: String(formData.get('name') ?? ''), sku: String(formData.get('sku') ?? ''), category_id: String(formData.get('category_id') || '') || null, price: Number(formData.get('price') ?? 0), stock: Number(formData.get('stock') ?? 0), status: String(formData.get('status') ?? 'draft') as 'draft' });
  }
  async function remove(formData: FormData) { 'use server'; await deleteProduct(String(formData.get('id'))); }
  return <div className="space-y-6"><PageHeader eyebrow="Admin catalog" title="Products" description="Create and manage products with consistent stock, status, and catalog metadata." /><Card><h2 className="text-xl font-semibold theme-heading">Create product</h2><form action={create} className="mt-4 grid gap-3 md:grid-cols-3"><Field label="Name"><input name="name" required /></Field><Field label="SKU"><input name="sku" required /></Field><Field label="Category"><select name="category_id"><option value="">No category</option>{categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Price"><input name="price" type="number" min="0" required /></Field><Field label="Stock"><input name="stock" type="number" min="0" required /></Field><Field label="Status"><select name="status"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></Field><Button className="md:col-span-3">Create product</Button></form></Card>{products?.length ? <TableShell><table><thead><tr><th>Product</th><th>Status</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map((item) => <tr key={item.id}><td><Link className="font-medium theme-heading" href={`/admin/products/${item.id}`}>{item.name}</Link><p className="text-sm theme-text-muted">{item.sku}</p></td><td><StatusBadge status={item.status} /></td><td>{item.categories?.name ?? <span className="theme-text-muted">Uncategorized</span>}</td><td>Rp {Number(item.price).toLocaleString('id-ID')}</td><td><Badge tone={Number(item.stock) < 5 ? 'warning' : 'muted'}>{item.stock} stock</Badge></td><td><div className="flex flex-wrap gap-2"><Link className="theme-brand" href={`/admin/products/${item.id}`}>Edit</Link><form action={remove}><input type="hidden" name="id" value={item.id} /><button className="theme-text-muted">Delete</button></form></div></td></tr>)}</tbody></table></TableShell> : <EmptyState icon="☾" title="No products yet" description="Create your first catalog item above." />}</div>;
}
