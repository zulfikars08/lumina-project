import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('admin_users.manage'); return <h1>Users</h1>; }
