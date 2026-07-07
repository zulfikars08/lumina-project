import Link from 'next/link';
import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function OrdersPage(){
  const user=await requireUser();
  const {data:orders}=await supabaseAdmin.from('orders').select('id,order_number,status,grand_total,created_at').eq('user_id',user.id).order('created_at',{ascending:false});
  return <><StoreHeader/><AccountShell user={user}><h2 className="text-2xl font-semibold theme-heading">Orders</h2><div className="mt-6 grid gap-3">{orders?.length?orders.map((order)=><Link key={order.id} href={`/account/orders/${order.id}`} className="rounded-3xl border theme-border p-4"><p className="font-medium">{order.order_number}</p><p className="text-sm theme-text-muted">{order.status} · {new Date(order.created_at).toLocaleDateString('id-ID')} · Rp {Number(order.grand_total).toLocaleString('id-ID')}</p></Link>):<p className="theme-text-muted">No orders yet.</p>}</div></AccountShell><StoreFooter/></>;
}
