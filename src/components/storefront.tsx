/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { imageUrl } from '@/lib/public/catalog';
import { ThemeToggle } from '@/components/theme-toggle';

type CardProduct = {
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  categories?: { name: string; slug: string } | { name: string; slug: string }[] | null;
  product_images?: Array<{ file_path: string; is_primary: boolean; alt_text?: string | null; sort_order?: number }>;
};

export function StoreHeader() {
  return <header className="sticky top-0 z-20 border-b bg-[var(--surface)]/95 backdrop-blur theme-border"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3"><Link href="/" className="shrink-0 text-xl font-semibold tracking-[0.18em] theme-heading sm:text-2xl">LUMINA</Link><nav className="hidden gap-6 text-sm theme-text-muted md:flex"><Link href="/">Home</Link><Link href="/products">Products</Link><Link href="/categories">Categories</Link><Link href="/blog">Blog</Link><Link href="/about">About</Link><Link href="/faq">FAQ</Link></nav><div className="flex shrink-0 items-center gap-2 text-sm theme-text sm:gap-3"><ThemeToggle/><Link href="/products" className="hidden rounded-full px-4 py-2 theme-button-soft sm:block">Search</Link><Link href="/account/wishlist" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]" title="Wishlist" aria-label="Wishlist">♡</Link><Link href="/account/cart" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]" title="Cart">Bag</Link><Link href="/account" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]">Account</Link></div></div><nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 text-sm theme-text-muted md:hidden"><Link className="shrink-0 rounded-full px-3 py-1 theme-button-soft" href="/">Home</Link><Link className="shrink-0 rounded-full px-3 py-1 theme-button-soft" href="/products">Products</Link><Link className="shrink-0 rounded-full px-3 py-1 theme-button-soft" href="/categories">Categories</Link><Link className="shrink-0 rounded-full px-3 py-1 theme-button-soft" href="/blog">Blog</Link><Link className="shrink-0 rounded-full px-3 py-1 theme-button-soft" href="/faq">FAQ</Link></nav></header>;
}

export function StoreFooter() {
  const links = ['Contact', 'FAQ', 'How To Order', 'Payment Guide', 'Privacy Policy', 'Terms & Conditions', 'Return/Refund Policy'];
  return <footer className="mt-20 border-t bg-[var(--surface)] theme-border theme-text"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3"><div><h2 className="text-xl font-semibold tracking-[0.2em] theme-heading">LUMINA</h2><p className="mt-4 text-sm theme-text-muted">Soft rituals, thoughtful formulas, and everyday beauty essentials curated for modern routines.</p></div><div><h3 className="font-medium theme-text">Information</h3><div className="mt-4 grid gap-2 text-sm theme-text-muted">{links.map((link) => <Link key={link} href={`/${link.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}>{link}</Link>)}</div></div><div><h3 className="font-medium theme-text">Social</h3><p className="mt-4 text-sm theme-text-muted">Instagram · TikTok · YouTube</p><p className="mt-6 text-sm theme-text-muted">Payment information placeholder</p></div></div></footer>;
}

export function ProductCard({ product }: { product: CardProduct }) {
  const primary = [...(product.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
  const url = imageUrl('products', primary?.file_path);
  return <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-3xl border theme-surface transition hover:-translate-y-1"><div className="aspect-[4/5] bg-[var(--surface-muted)]">{url ? <img src={url} alt={primary?.alt_text ?? product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm theme-text-muted">Lumina image</div>}</div><div className="p-4"><p className="text-xs uppercase tracking-[0.2em] theme-brand">{category?.name ?? 'Lumina'}</p><h3 className="mt-2 font-medium theme-text">{product.name}</h3><div className="mt-3 flex items-center gap-2"><span className="font-semibold theme-heading">Rp {Number(product.discount_price ?? product.price).toLocaleString('id-ID')}</span>{product.discount_price ? <span className="text-sm line-through theme-text-muted">Rp {Number(product.price).toLocaleString('id-ID')}</span> : null}</div>{product.discount_price ? <span className="mt-3 inline-block rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs theme-brand">Sale</span> : null}</div></Link>;
}

export function EmptyState({ title }: { title: string }) {
  return <div className="rounded-3xl border border-dashed p-10 text-center theme-muted theme-border">{title}</div>;
}
