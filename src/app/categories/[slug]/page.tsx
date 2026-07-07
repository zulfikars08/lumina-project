import { notFound } from 'next/navigation';
import { EmptyState, ProductCard, StoreFooter, StoreHeader } from '@/components/storefront';
import { getActiveCategories, getActiveProducts } from '@/lib/public/catalog';

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getActiveCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const products = await getActiveProducts({ category: slug, limit: 24 });
  return <><StoreHeader /><main className="mx-auto max-w-7xl px-4 py-10"><div className="rounded-[2rem] bg-[var(--surface-muted)] p-8"><p className="text-sm uppercase tracking-[0.3em] theme-brand">Category</p><h1 className="mt-3 text-4xl font-semibold theme-heading">{category.name}</h1><p className="mt-3 theme-text-muted">{category.description ?? 'Selected Lumina products for this category.'}</p></div>{products.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-8"><EmptyState title="No active products in this category yet." /></div>}</main><StoreFooter /></>;
}
