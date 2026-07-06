import { saveProduct } from '@/lib/admin/catalog-actions';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function ProductDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ image?: string }> }) {
  await requirePermission('products.manage');
  const { id } = await params;
  const { image: imageState } = await searchParams;
  const [{ data: product }, { data: categories }, { data: images }] = await Promise.all([
    supabaseAdmin.from('products').select('*').eq('id', id).single(),
    supabaseAdmin.from('categories').select('id,name').order('name'),
    supabaseAdmin.from('product_images').select('*').eq('product_id', id).order('sort_order'),
  ]);
  if (!product) return <h1>Product not found</h1>;
  async function update(formData: FormData) {
    'use server';
    await saveProduct({
      id, name: String(formData.get('name') ?? ''), slug: String(formData.get('slug') ?? ''), sku: String(formData.get('sku') ?? ''),
      category_id: String(formData.get('category_id') || '') || null, short_description: String(formData.get('short_description') ?? ''),
      description: String(formData.get('description') ?? ''), price: Number(formData.get('price') ?? 0), discount_price: formData.get('discount_price') ? Number(formData.get('discount_price')) : null,
      stock: Number(formData.get('stock') ?? 0), status: String(formData.get('status') ?? 'draft') as 'draft',
    });
  }
  return <section><h1>Edit product</h1>{imageState ? <p>Image status: {imageState}</p> : null}<form action={update}><input name="name" defaultValue={product.name} required /><input name="slug" defaultValue={product.slug} /><input name="sku" defaultValue={product.sku} required /><select name="category_id" defaultValue={product.category_id ?? ''}><option value="">No category</option>{categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><textarea name="short_description" defaultValue={product.short_description ?? ''} /><textarea name="description" defaultValue={product.description ?? ''} /><input name="price" type="number" min="0" defaultValue={product.price} /><input name="discount_price" type="number" min="0" defaultValue={product.discount_price ?? ''} /><input name="stock" type="number" min="0" defaultValue={product.stock} /><select name="status" defaultValue={product.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select><button>Save</button></form><h2>Images</h2><form action={`/admin/products/${id}/images`} method="post" encType="multipart/form-data"><input name="image" type="file" accept="image/png,image/jpeg,image/webp" required /><label><input name="is_primary" type="checkbox" /> Primary</label><button>Upload</button></form><ul>{images?.map((image) => <li key={image.id}>{image.file_path} {image.is_primary ? '(primary)' : null}<form action={`/admin/products/${id}/images/${image.id}/primary`} method="post" style={{ display: 'inline' }}><button>Set primary</button></form><form action={`/admin/products/${id}/images/${image.id}`} method="post" style={{ display: 'inline' }}><button>Delete</button></form></li>)}</ul></section>;
}
