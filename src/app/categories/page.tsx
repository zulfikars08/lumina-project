import Link from 'next/link';
import { EmptyState, StoreFooter, StoreHeader } from '@/components/storefront';
import { getActiveCategories } from '@/lib/public/catalog';

export default async function CategoriesPage() {
  const categories = await getActiveCategories();
  return <><StoreHeader /><main className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-4xl font-semibold theme-heading">Categories</h1><p className="mt-3 theme-text-muted">Explore Lumina by routine, finish, and product family.</p>{categories.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-[2rem] border theme-border bg-[var(--surface)] p-8 shadow-sm"><p className="text-sm uppercase tracking-[0.3em] theme-brand">Category</p><h2 className="mt-3 text-2xl font-semibold theme-heading">{category.name}</h2><p className="mt-3 theme-text-muted">{category.description ?? 'Discover selected products.'}</p></Link>)}</div> : <div className="mt-8"><EmptyState title="Categories coming soon." /></div>}</main><StoreFooter /></>;
}
