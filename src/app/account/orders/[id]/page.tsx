import { notFound } from 'next/navigation';
import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { PayNow } from '@/components/pay-now';

export default async function OrderDetailPage({params}:{params:Promise<{id:string}>}){
  const user=await requireUser();
  const {id}=await params;
  const {data:order}=await supabaseAdmin.from('orders').select('*,order_items(*)').eq('id',id).eq('user_id',user.id).maybeSingle();
  if(!order) notFound();
  const {data:payment}=await supabaseAdmin.from('payments').select('status,snap_redirect_url').eq('order_id',id).maybeSingle();
  const address=order.shipping_address as {recipient_name:string;phone:string;full_address:string;district:string;city:string;province:string;postal_code:string};
  return <><StoreHeader/><AccountShell user={user}><h2 className="text-2xl font-semibold theme-heading">Order {order.order_number}</h2><p className="mt-2 text-sm theme-text-muted">Status: {order.status} · Payment: {payment?.status ?? 'PENDING'}</p><section className="mt-6 rounded-3xl border theme-border p-5"><h3 className="font-semibold theme-heading">Shipping address</h3><p className="mt-2 text-sm theme-text-muted">{address.recipient_name} · {address.phone}<br/>{address.full_address}, {address.district}, {address.city}, {address.province} {address.postal_code}</p></section><section className="mt-6 grid gap-3">{order.order_items?.map((item:{id:string;product_name:string;variant_name:string|null;sku:string;quantity:number;unit_price:number;total_price:number})=><div key={item.id} className="rounded-3xl border theme-border p-4"><p className="font-medium">{item.product_name}</p>{item.variant_name?<p className="text-sm theme-text-muted">{item.variant_name} · {item.sku}</p>:null}<p className="text-sm theme-text-muted">Rp {Number(item.unit_price).toLocaleString('id-ID')} × {item.quantity} = Rp {Number(item.total_price).toLocaleString('id-ID')}</p></div>)}</section><section className="mt-6 rounded-3xl bg-[var(--surface-muted)] p-5"><p>Subtotal: Rp {Number(order.subtotal).toLocaleString('id-ID')}</p><p>Discount: Rp {Number(order.discount_total).toLocaleString('id-ID')}</p><p>Shipping: Rp 0</p><p className="font-semibold">Grand total: Rp {Number(order.grand_total).toLocaleString('id-ID')}</p><div className="mt-6 rounded-3xl bg-[var(--surface)] p-5"><h3 className="font-semibold theme-heading">Invoice draft</h3><p>Lumina store identity placeholder</p><p>{user.name} · {user.email}</p><p>Order date: {new Date(order.created_at).toLocaleString('id-ID')}</p><p>Status: {order.status}</p></div>{order.status==='PENDING_PAYMENT'?<PayNow orderId={order.id} clientKey={env.midtransClientKey} redirectUrl={payment?.snap_redirect_url}/>:<button disabled className="mt-4 rounded-full px-6 py-3 theme-button-soft">Payment unavailable</button>}</section></AccountShell><StoreFooter/></>;
}
