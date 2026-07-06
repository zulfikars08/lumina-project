import Link from 'next/link';
import { deleteVariant, saveVariant } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function VariantsPage() {
  await requirePermission('products.manage');
  const [{ data: variants }, { data: products }] = await Promise.all([
    supabaseAdmin.from('product_variants').select('*,products(name)').order('created_at', { ascending: false }),
    supabaseAdmin.from('products').select('id,name').order('name'),
  ]);
  async function create(formData: FormData) {
    'use server';
    await saveVariant({ product_id: String(formData.get('product_id')), name: String(formData.get('name') ?? ''), sku: String(formData.get('sku') ?? ''), price: formData.get('price') ? Number(formData.get('price')) : null, stock: Number(formData.get('stock') ?? 0) });
  }
  async function remove(formData: FormData) { 'use server'; await deleteVariant(String(formData.get('id'))); }
  return <section><h1>Variants</h1><form action={create}><select name="product_id" required>{products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input name="name" placeholder="Variant name" required /><input name="sku" placeholder="SKU" required /><input name="price" type="number" min="0" placeholder="Override price" /><input name="stock" type="number" min="0" placeholder="Stock" required /><button>Create</button></form><ul>{variants?.map((item) => <li key={item.id}>{item.products?.name} / <Link href={`/admin/variants/${item.id}`}>{item.name}</Link> — stock {item.stock} <form action={remove} style={{ display: 'inline' }}><input type="hidden" name="id" value={item.id} /><button>Delete</button></form></li>)}</ul></section>;
}
