import Link from 'next/link';
import { adminMenu } from '@/lib/admin/menu';
import { hasPermission, requirePermission } from '@/lib/auth/rbac';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission('dashboard.read');
  const items = adminMenu.filter((item) => hasPermission(user, item.permission));
  return <div style={{ display: 'flex', minHeight: '100vh' }}><aside style={{ width: 240, padding: 24, borderRight: '1px solid #eee' }}><h2>Lumina Admin</h2><nav style={{ display: 'grid', gap: 8 }}>{items.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></aside><main style={{ flex: 1, padding: 24 }}>{children}</main></div>;
}
