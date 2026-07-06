import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('dashboard.read'); return <h1>Dashboard</h1>; }
