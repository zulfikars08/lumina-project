import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('roles.manage'); return <h1>Roles</h1>; }
