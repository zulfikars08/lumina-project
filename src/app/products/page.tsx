import Link from 'next/link';
import { EmptyState, ProductCard, StoreFooter, StoreHeader } from '@/components/storefront';
import { getActiveCategories, getActiveProducts } from '@/lib/public/catalog';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getActiveProducts({ search: params.q, category: params.category, sort: params.sort, limit: 24 }),
    getActiveCategories(),
  ]);

  return <><StoreHeader /><main className="mx-auto max-w-7xl px-4 py-10"><div className="rounded-[2rem] bg-[var(--surface-muted)] p-8"><p className="text-sm uppercase tracking-[0.3em] theme-brand">Shop Lumina</p><h1 className="mt-3 text-4xl font-semibold theme-heading">Products</h1><p className="mt-3 theme-text-muted">Browse active Lumina products and beauty essentials.</p></div><form className="mt-8 grid gap-3 rounded-3xl border theme-border bg-[var(--surface)] p-4 md:grid-cols-[1fr_220px_220px_auto]" action="/products"><input name="q" defaultValue={params.q ?? ''} placeholder="Search products" className="rounded-full border theme-border bg-[var(--surface-muted)] px-4 py-3" /><select name="category" defaultValue={params.category ?? ''} className="rounded-full border theme-border bg-[var(--surface-muted)] px-4 py-3"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select><select name="sort" defaultValue={params.sort ?? 'latest'} className="rounded-full border theme-border bg-[var(--surface-muted)] px-4 py-3"><option value="latest">Latest</option><option value="price_asc">Price low to high</option><option value="price_desc">Price high to low</option><option value="name_asc">Name A-Z</option></select><button className="rounded-full px-6 py-3 theme-button">Apply</button></form><div className="mt-4 flex gap-3 text-sm theme-text-muted"><Link href="/products">Clear filters</Link><span>{products.length} products</span></div>{products.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-8"><EmptyState title="No active products match this search." /></div>}</main><StoreFooter /></>;
}
