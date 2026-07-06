import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('customers.read'); return <h1>Customers</h1>; }
