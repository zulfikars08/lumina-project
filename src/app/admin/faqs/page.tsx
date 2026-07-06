import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('pages.manage'); return <h1>FAQs</h1>; }
