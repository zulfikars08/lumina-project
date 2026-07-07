import { Card, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { requirePermission } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

function Kpi({ label, value }: { label: string; value: number }) {
  return <Card className="p-5"><p className="text-sm theme-text-muted">{label}</p><p className="mt-2 text-3xl font-semibold theme-heading">{value.toLocaleString('id-ID')}</p></Card>;
}

export default async function Page() {
  await requirePermission('dashboard.read');
  const [products, orders, customers, pendingPayments, lowStock, recentOrders] = await Promise.all([
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'PENDING_PAYMENT'),
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).lt('stock', 5),
    supabaseAdmin.from('orders').select('id,order_number,status,grand_total,created_at').order('created_at', { ascending: false }).limit(5),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Dashboard" description="Operational snapshot from existing store data." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Total Products" value={products.count ?? 0} />
        <Kpi label="Orders" value={orders.count ?? 0} />
        <Kpi label="Customers" value={customers.count ?? 0} />
        <Kpi label="Pending Payment" value={pendingPayments.count ?? 0} />
        <Kpi label="Low Stock" value={lowStock.count ?? 0} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h2 className="text-xl font-semibold theme-heading">Recent Orders</h2><div className="mt-4 grid gap-3">{recentOrders.data?.length ? recentOrders.data.map((order) => <div key={order.id} className="flex items-center justify-between rounded-2xl border p-4 theme-border"><div><p className="font-medium theme-heading">{order.order_number}</p><p className="text-sm theme-text-muted">Rp {Number(order.grand_total).toLocaleString('id-ID')}</p></div><StatusBadge status={order.status} /></div>) : <EmptyState icon="☾" title="No orders yet" description="Recent orders appear here after checkout." />}</div></Card>
        <Card><h2 className="text-xl font-semibold theme-heading">Recent Activity</h2><EmptyState icon="✦" title="No activity feed yet" description="Audit logs stay in their own module. No fake activity shown." /></Card>
      </div>
    </div>
  );
}
