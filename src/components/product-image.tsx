/* eslint-disable @next/next/no-img-element */
import { imageUrl } from '@/lib/public/catalog';

export function ProductImage({ path, alt, className = '' }: { path?: string | null; alt: string; className?: string }) {
  const src = path ? imageUrl('products', path) : null;
  return <div className={`relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--surface-muted),var(--surface))] ${className}`}><div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs font-medium uppercase tracking-[0.25em] theme-brand">Lumina</div>{src ? <img src={src} alt={alt} className="relative h-full w-full object-cover" /> : null}</div>;
}
