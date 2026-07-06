import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('audit_logs.read'); return <h1>Audit Logs</h1>; }
