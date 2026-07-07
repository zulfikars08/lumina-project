/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { imageUrl } from '@/lib/public/catalog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui';

type CardProduct = {
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  categories?: { name: string; slug: string } | { name: string; slug: string }[] | null;
  product_images?: Array<{ file_path: string; is_primary: boolean; alt_text?: string | null; sort_order?: number }>;
};

export function StoreHeader() {
  const nav = [
    ['Home', '/'],
    ['Products', '/products'],
    ['Categories', '/categories'],
    ['Blog', '/blog'],
    ['FAQ', '/faq'],
  ];
  return (
    <header className="sticky top-0 z-20 border-b bg-[var(--surface)]/95 backdrop-blur theme-border">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0 text-lg font-semibold tracking-[0.18em] theme-heading sm:text-2xl">LUMINA</Link>
          <div className="flex min-w-0 items-center justify-end gap-1 text-xs theme-text sm:hidden">
            <ThemeToggle />
            <Link href="/account/wishlist" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]" title="Wishlist" aria-label="Wishlist">♡</Link>
            <Link href="/account/cart" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]" title="Cart">Bag</Link>
            <Link href="/account" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]">Acct</Link>
          </div>
        </div>
        <nav className="hidden gap-6 text-sm theme-text-muted md:flex">
          <Link href="/">Home</Link><Link href="/products">Products</Link><Link href="/categories">Categories</Link><Link href="/blog">Blog</Link><Link href="/about">About</Link><Link href="/faq">FAQ</Link>
        </nav>
        <div className="hidden shrink-0 items-center gap-3 text-sm theme-text sm:flex">
          <ThemeToggle />
          <Link href="/products" className="rounded-full px-4 py-2 theme-button-soft">Search</Link>
          <Link href="/account/wishlist" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]" title="Wishlist" aria-label="Wishlist">♡</Link>
          <Link href="/account/cart" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]" title="Cart">Bag</Link>
          <Link href="/account" className="rounded-full px-2 py-1 hover:bg-[var(--surface-muted)]">Account</Link>
        </div>
      </div>
      <nav className="mx-auto grid max-w-7xl grid-cols-5 gap-1 px-4 pb-3 text-center text-xs theme-text-muted md:hidden">
        {nav.map(([label, href]) => <Link key={href} className="min-w-0 rounded-full px-2 py-1.5 theme-button-soft" href={href}>{label}</Link>)}
      </nav>
    </header>
  );
}

export function StoreFooter() {
  const links = ['Contact', 'FAQ', 'How To Order', 'Payment Guide', 'Privacy Policy', 'Terms & Conditions', 'Return/Refund Policy'];
  return <footer className="mt-20 border-t bg-[var(--surface)] theme-border theme-text"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3"><div><h2 className="text-xl font-semibold tracking-[0.2em] theme-heading">LUMINA</h2><p className="mt-4 text-sm theme-text-muted">Soft rituals, thoughtful formulas, and everyday beauty essentials curated for modern routines.</p></div><div><h3 className="font-medium theme-text">Information</h3><div className="mt-4 grid gap-2 text-sm theme-text-muted">{links.map((link) => <Link key={link} href={`/${link.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}>{link}</Link>)}</div></div><div><h3 className="font-medium theme-text">Social</h3><p className="mt-4 text-sm theme-text-muted">Instagram · TikTok · YouTube</p><p className="mt-6 text-sm theme-text-muted">Payment information placeholder</p></div></div></footer>;
}

export function ProductCard({ product }: { product: CardProduct }) {
  const primary = [...(product.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
  const url = imageUrl('products', primary?.file_path);
  return <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-[2rem] border theme-surface transition duration-300 hover:-translate-y-1 hover:shadow-2xl"><div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-muted)]"><div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2"><Badge>{category?.name ?? 'Lumina'}</Badge>{product.discount_price ? <Badge tone="warning">Sale</Badge> : null}</div><span className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)]/90 theme-brand shadow-sm transition group-hover:scale-110">♡</span>{url ? <img src={url} alt={primary?.alt_text ?? product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm theme-text-muted">Lumina image</div>}</div><div className="p-5"><p className="text-xs uppercase tracking-[0.22em] theme-brand">Beauty essential</p><h3 className="mt-2 line-clamp-2 font-medium theme-text">{product.name}</h3><div className="mt-4 flex items-baseline gap-2"><span className="text-lg font-semibold theme-heading">Rp {Number(product.discount_price ?? product.price).toLocaleString('id-ID')}</span>{product.discount_price ? <span className="text-sm line-through theme-text-muted">Rp {Number(product.price).toLocaleString('id-ID')}</span> : null}</div><p className="mt-3 text-sm theme-text-muted">Soft ritual, everyday glow.</p></div></Link>;
}

export function EmptyState({ title }: { title: string }) {
  return <div className="rounded-3xl border border-dashed p-10 text-center theme-muted theme-border">{title}</div>;
}
