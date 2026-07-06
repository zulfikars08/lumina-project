import Link from 'next/link';
import { AuthUser } from '@/lib/auth/rbac';

export function AccountShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const items = [['/account','Overview'],['/account/profile','Profile'],['/account/addresses','Addresses'],['/account/wishlist','Wishlist'],['/account/cart','Cart'],['/account/orders','Orders']];
  return <main className="mx-auto max-w-7xl px-4 py-10"><div className="rounded-[2rem] bg-rose-50 p-8"><p className="text-sm uppercase tracking-[0.3em] text-rose-500">Lumina Account</p><h1 className="mt-3 text-3xl font-semibold text-rose-950">{user.name}</h1><p className="text-stone-600">{user.email}</p></div><div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]"><aside className="rounded-3xl border border-rose-100 bg-white p-4"><nav className="grid gap-2">{items.map(([href,label]) => <Link className="rounded-full px-4 py-2 hover:bg-rose-50" key={href} href={href}>{label}</Link>)}</nav></aside><section className="rounded-3xl border border-rose-100 bg-white p-6">{children}</section></div></main>;
}
