import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { requireUser } from '@/lib/auth/rbac';
export default async function AccountPage(){ const user=await requireUser(); return <><StoreHeader/><AccountShell user={user}><h2 className="text-2xl font-semibold theme-heading">Account overview</h2><p className="mt-2 theme-text-muted">Manage profile, addresses, wishlist, and cart.</p></AccountShell><StoreFooter/></>; }
