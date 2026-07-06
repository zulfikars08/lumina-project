import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('reviews.manage'); return <h1>Reviews</h1>; }
