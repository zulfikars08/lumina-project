import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('settings.manage'); return <h1>Settings</h1>; }
