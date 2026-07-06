import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('discounts.manage'); return <h1>Vouchers</h1>; }
