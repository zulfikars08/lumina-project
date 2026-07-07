import Link from 'next/link';
import { adminMenu } from '@/lib/admin/menu';
import { hasPermission, requirePermission } from '@/lib/auth/rbac';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission('dashboard.read');
  const items = adminMenu.filter((item) => hasPermission(user, item.permission));
  return <div className="min-h-screen theme-text lg:flex"><aside className="border-b p-4 theme-surface lg:w-64 lg:border-b-0 lg:border-r lg:p-6"><h2 className="text-xl font-semibold theme-heading">Lumina Admin</h2><nav className="mt-4 flex gap-2 overflow-x-auto lg:grid">{items.map((item) => <Link className="shrink-0 rounded-full px-3 py-2 text-sm theme-text hover:bg-[var(--surface-muted)]" key={item.href} href={item.href}>{item.label}</Link>)}</nav></aside><main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main></div>;
}
