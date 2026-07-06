import { requirePermission } from '@/lib/auth/rbac';
export default async function Page() { await requirePermission('blog.manage'); return <h1>Blog</h1>; }
