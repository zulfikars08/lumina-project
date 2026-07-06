/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { imageUrl } from '@/lib/public/catalog';

type CardProduct = {
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  categories?: { name: string; slug: string } | { name: string; slug: string }[] | null;
  product_images?: Array<{ file_path: string; is_primary: boolean; alt_text?: string | null; sort_order?: number }>;
};

export function StoreHeader() {
  return <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4"><Link href="/" className="text-2xl font-semibold tracking-[0.2em] text-rose-900">LUMINA</Link><nav className="hidden gap-6 text-sm text-stone-700 md:flex"><Link href="/">Home</Link><Link href="/products">Products</Link><Link href="/categories">Categories</Link><Link href="/blog">Blog</Link><Link href="/about">About</Link><Link href="/faq">FAQ</Link></nav><div className="flex items-center gap-3 text-sm"><Link href="/products" className="hidden rounded-full bg-rose-50 px-4 py-2 text-rose-900 sm:block">Search</Link><Link href="/account/wishlist" title="Wishlist">♡</Link><Link href="/account/cart" title="Cart">Bag</Link><Link href="/account">Account</Link></div></div></header>;
}

export function StoreFooter() {
  const links = ['Contact', 'FAQ', 'How To Order', 'Payment Guide', 'Privacy Policy', 'Terms & Conditions', 'Return/Refund Policy'];
  return <footer className="mt-20 bg-stone-950 text-stone-100"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3"><div><h2 className="text-xl font-semibold tracking-[0.2em]">LUMINA</h2><p className="mt-4 text-sm text-stone-300">Soft rituals, thoughtful formulas, and everyday beauty essentials curated for modern routines.</p></div><div><h3 className="font-medium">Information</h3><div className="mt-4 grid gap-2 text-sm text-stone-300">{links.map((link) => <Link key={link} href={`/${link.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}>{link}</Link>)}</div></div><div><h3 className="font-medium">Social</h3><p className="mt-4 text-sm text-stone-300">Instagram · TikTok · YouTube</p><p className="mt-6 text-sm text-stone-400">Payment information placeholder</p></div></div></footer>;
}

export function ProductCard({ product }: { product: CardProduct }) {
  const primary = [...(product.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
  const url = imageUrl('products', primary?.file_path);
  return <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="aspect-[4/5] bg-gradient-to-br from-rose-50 to-stone-100">{url ? <img src={url} alt={primary?.alt_text ?? product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-stone-400">Lumina image</div>}</div><div className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-rose-500">{category?.name ?? 'Lumina'}</p><h3 className="mt-2 font-medium text-stone-900">{product.name}</h3><div className="mt-3 flex items-center gap-2"><span className="font-semibold text-rose-900">Rp {Number(product.discount_price ?? product.price).toLocaleString('id-ID')}</span>{product.discount_price ? <span className="text-sm text-stone-400 line-through">Rp {Number(product.price).toLocaleString('id-ID')}</span> : null}</div>{product.discount_price ? <span className="mt-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700">Sale</span> : null}</div></Link>;
}

export function EmptyState({ title }: { title: string }) {
  return <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 p-10 text-center text-stone-600">{title}</div>;
}
