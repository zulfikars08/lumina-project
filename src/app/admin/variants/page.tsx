import Link from 'next/link';
import { deleteVariant, saveVariant } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Badge, Button, Card, EmptyState, Field, PageHeader, StatusBadge, TableShell } from '@/components/ui';

export default async function VariantsPage() {
  await requirePermission('products.manage');
  const [{ data: variants }, { data: products }] = await Promise.all([
    supabaseAdmin.from('product_variants').select('*,products(name)').order('created_at', { ascending: false }),
    supabaseAdmin.from('products').select('id,name').order('name'),
  ]);
  async function create(formData: FormData) { 'use server'; await saveVariant({ product_id: String(formData.get('product_id')), name: String(formData.get('name') ?? ''), sku: String(formData.get('sku') ?? ''), price: formData.get('price') ? Number(formData.get('price')) : null, stock: Number(formData.get('stock') ?? 0) }); }
  async function remove(formData: FormData) { 'use server'; await deleteVariant(String(formData.get('id'))); }
  return <div className="space-y-6"><PageHeader eyebrow="Admin catalog" title="Variants" description="Manage product options, SKU overrides, stock, and active state." /><Card><h2 className="text-xl font-semibold theme-heading">Create variant</h2><form action={create} className="mt-4 grid gap-3 md:grid-cols-3"><Field label="Product"><select name="product_id" required>{products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Variant name"><input name="name" required /></Field><Field label="SKU"><input name="sku" required /></Field><Field label="Override price"><input name="price" type="number" min="0" /></Field><Field label="Stock"><input name="stock" type="number" min="0" required /></Field><Button className="self-end">Create variant</Button></form></Card>{variants?.length ? <TableShell><table><thead><tr><th>Variant</th><th>Product</th><th>Status</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{variants.map((item) => <tr key={item.id}><td><Link className="font-medium theme-heading" href={`/admin/variants/${item.id}`}>{item.name}</Link><p className="text-sm theme-text-muted">{item.sku}</p></td><td>{item.products?.name}</td><td><StatusBadge status={item.is_active ? 'active' : 'draft'} /></td><td>{item.price ? `Rp ${Number(item.price).toLocaleString('id-ID')}` : <span className="theme-text-muted">Uses product price</span>}</td><td><Badge tone={Number(item.stock) < 5 ? 'warning' : 'muted'}>{item.stock} stock</Badge></td><td><div className="flex flex-wrap gap-2"><Link className="theme-brand" href={`/admin/variants/${item.id}`}>Edit</Link><form action={remove}><input type="hidden" name="id" value={item.id} /><button className="theme-text-muted">Delete</button></form></div></td></tr>)}</tbody></table></TableShell> : <EmptyState icon="◇" title="No variants yet" description="Add product sizes, shades, or SKU-specific stock." />}</div>;
}
