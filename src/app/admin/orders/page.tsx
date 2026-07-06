import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('orders.manage'); return <h1>Orders</h1>; }
