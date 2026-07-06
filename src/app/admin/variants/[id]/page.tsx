import { saveVariant } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function VariantEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('products.manage');
  const { id } = await params;
  const [{ data: variant }, { data: products }] = await Promise.all([
    supabaseAdmin.from('product_variants').select('*').eq('id', id).single(),
    supabaseAdmin.from('products').select('id,name').order('name'),
  ]);
  if (!variant) return <h1>Variant not found</h1>;
  async function update(formData: FormData) {
    'use server';
    await saveVariant({
      id,
      product_id: String(formData.get('product_id')),
      name: String(formData.get('name') ?? ''),
      sku: String(formData.get('sku') ?? ''),
      option_values: Object.fromEntries(String(formData.get('option_values') ?? '').split('\n').filter(Boolean).map((line) => line.split('=').map((v) => v.trim())).filter((pair) => pair.length === 2)),
      price: formData.get('price') ? Number(formData.get('price')) : null,
      discount_price: formData.get('discount_price') ? Number(formData.get('discount_price')) : null,
      stock: Number(formData.get('stock') ?? 0),
      is_active: formData.get('is_active') === 'on',
    });
  }
  const optionText = Object.entries(variant.option_values ?? {}).map(([k, v]) => `${k}=${v}`).join('\n');
  return <section><h1>Edit variant</h1><form action={update}><select name="product_id" defaultValue={variant.product_id}>{products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input name="name" defaultValue={variant.name} required /><input name="sku" defaultValue={variant.sku} required /><textarea name="option_values" defaultValue={optionText} placeholder="shade=Rose\nsize=30ml" /><input name="price" type="number" min="0" defaultValue={variant.price ?? ''} /><input name="discount_price" type="number" min="0" defaultValue={variant.discount_price ?? ''} /><input name="stock" type="number" min="0" defaultValue={variant.stock} /><label><input name="is_active" type="checkbox" defaultChecked={variant.is_active} /> Active</label><button>Save</button></form></section>;
}
