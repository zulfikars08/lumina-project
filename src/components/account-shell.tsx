import Link from 'next/link';
import { AuthUser } from '@/lib/auth/rbac';

export function AccountShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const items = [['/account','Overview'],['/account/profile','Profile'],['/account/addresses','Addresses'],['/account/wishlist','Wishlist'],['/account/cart','Cart'],['/account/orders','Orders']];
  return <main className="mx-auto max-w-7xl px-4 py-10 theme-text"><div className="rounded-[2rem] p-8 theme-muted"><p className="text-sm uppercase tracking-[0.3em] theme-brand">Lumina Account</p><h1 className="mt-3 text-3xl font-semibold theme-heading">{user.name}</h1><p className="theme-text-muted">{user.email}</p></div><div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]"><aside className="rounded-3xl border p-4 theme-surface"><nav className="flex gap-2 overflow-x-auto lg:grid">{items.map(([href,label]) => <Link className="shrink-0 rounded-full px-4 py-2 theme-text transition hover:bg-[var(--surface-muted)]" key={href} href={href}>{label}</Link>)}</nav></aside><section className="rounded-3xl border p-6 theme-surface">{children}</section></div></main>;
}
