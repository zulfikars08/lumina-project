import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { ButtonLink, Card, PageHeader } from '@/components/ui';
import { requireUser } from '@/lib/auth/rbac';

const cards = [
  ['Profile', 'Manage personal details and password.', '/account/profile'],
  ['Addresses', 'Edit shipping addresses for checkout.', '/account/addresses'],
  ['Wishlist', 'Review saved beauty picks.', '/account/wishlist'],
  ['Orders', 'Track purchases and payment status.', '/account/orders'],
  ['Cart', 'Review items before checkout.', '/account/cart'],
];

export default async function AccountPage() {
  const user = await requireUser();
  return <><StoreHeader /><AccountShell user={user}><div className="space-y-6"><PageHeader eyebrow="Account" title="Account overview" description="Manage your Lumina profile, orders, wishlist, and cart." /><div className="grid gap-4 md:grid-cols-2">{cards.map(([title, description, href]) => <Card key={href} className="flex flex-col justify-between gap-6"><div><h2 className="text-xl font-semibold theme-heading">{title}</h2><p className="mt-2 theme-text-muted">{description}</p></div><ButtonLink href={href} variant="secondary">Open {title}</ButtonLink></Card>)}</div></div></AccountShell><StoreFooter /></>;
}
