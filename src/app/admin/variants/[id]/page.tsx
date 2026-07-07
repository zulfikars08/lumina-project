import { saveVariant } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Button, Card, EmptyState, Field, PageHeader, StatusBadge } from '@/components/ui';

export default async function VariantEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('products.manage');
  const { id } = await params;
  const [{ data: variant }, { data: products }] = await Promise.all([
    supabaseAdmin.from('product_variants').select('*').eq('id', id).single(),
    supabaseAdmin.from('products').select('id,name').order('name'),
  ]);
  if (!variant) return <EmptyState icon="☾" title="Variant not found" />;
  async function update(formData: FormData) {
    'use server';
    await saveVariant({ id, product_id: String(formData.get('product_id')), name: String(formData.get('name') ?? ''), sku: String(formData.get('sku') ?? ''), option_values: Object.fromEntries(String(formData.get('option_values') ?? '').split('\n').filter(Boolean).map((line) => line.split('=').map((v) => v.trim())).filter((pair) => pair.length === 2)), price: formData.get('price') ? Number(formData.get('price')) : null, discount_price: formData.get('discount_price') ? Number(formData.get('discount_price')) : null, stock: Number(formData.get('stock') ?? 0), is_active: formData.get('is_active') === 'on' });
  }
  const optionText = Object.entries(variant.option_values ?? {}).map(([k, v]) => `${k}=${v}`).join('\n');
  return <div className="space-y-6"><PageHeader eyebrow="Variant editor" title={variant.name} description="Edit SKU-specific pricing, options, stock, and active state." action={<StatusBadge status={variant.is_active ? 'active' : 'draft'} />} /><form action={update} className="space-y-6"><Card><h2 className="text-xl font-semibold theme-heading">General</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><Field label="Product"><select name="product_id" defaultValue={variant.product_id}>{products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Variant name"><input name="name" defaultValue={variant.name} required /></Field><Field label="SKU"><input name="sku" defaultValue={variant.sku} required /></Field></div></Card><div className="grid gap-6 lg:grid-cols-2"><Card><h2 className="text-xl font-semibold theme-heading">Pricing</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><Field label="Price"><input name="price" type="number" min="0" defaultValue={variant.price ?? ''} /></Field><Field label="Discount price"><input name="discount_price" type="number" min="0" defaultValue={variant.discount_price ?? ''} /></Field></div></Card><Card><h2 className="text-xl font-semibold theme-heading">Inventory</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><Field label="Stock"><input name="stock" type="number" min="0" defaultValue={variant.stock} /></Field><label className="flex items-center gap-2 text-sm theme-text"><input name="is_active" type="checkbox" defaultChecked={variant.is_active} /> Active</label></div></Card></div><Card><h2 className="text-xl font-semibold theme-heading">Option values</h2><Field label="One option per line"><textarea name="option_values" defaultValue={optionText} placeholder={'shade=Rose\nsize=30ml'} /></Field></Card><Button>Save variant</Button></form></div>;
}
