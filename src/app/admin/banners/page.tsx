import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('banners.manage'); return <h1>Banners</h1>; }
