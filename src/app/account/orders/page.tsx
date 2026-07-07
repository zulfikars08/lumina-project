import Link from 'next/link';
import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { ButtonLink, Card, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function OrdersPage() {
  const user = await requireUser();
  const { data: orders } = await supabaseAdmin.from('orders').select('id,order_number,status,grand_total,created_at').eq('user_id', user.id).order('created_at', { ascending: false });
  return <><StoreHeader /><AccountShell user={user}><div className="space-y-6"><PageHeader eyebrow="Account" title="Orders" description="Track order status, date, and grand total." />{orders?.length ? <div className="grid gap-4">{orders.map((order) => <Card key={order.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><Link href={`/account/orders/${order.id}`}><p className="font-semibold theme-heading">{order.order_number}</p><p className="mt-1 text-sm theme-text-muted">{new Date(order.created_at).toLocaleDateString('id-ID')} · Rp {Number(order.grand_total).toLocaleString('id-ID')}</p></Link><div className="flex flex-wrap items-center gap-3"><StatusBadge status={order.status} /><ButtonLink href={`/account/orders/${order.id}`} variant="secondary" size="sm">View order</ButtonLink></div></Card>)}</div> : <EmptyState icon="☾" title="No orders yet" description="Completed checkout orders appear here." action={<ButtonLink href="/products">Shop products</ButtonLink>} />}</div></AccountShell><StoreFooter /></>;
}
