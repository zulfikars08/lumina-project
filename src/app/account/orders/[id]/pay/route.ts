import { NextRequest, NextResponse } from 'next/server';
import { requireRouteUser } from '@/lib/auth/route-auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSnapTransaction } from '@/lib/payment/midtrans';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRouteUser(request);
  const { id } = await params;
  const { data: order } = await supabaseAdmin.from('orders').select('id,status,user_id,order_number').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status !== 'PENDING_PAYMENT') return NextResponse.json({ error: 'Order is not payable' }, { status: 400 });
  const { data: existing } = await supabaseAdmin.from('payments').select('*').eq('order_id', id).maybeSingle();
  if (existing?.snap_token) return NextResponse.json({ token: existing.snap_token, redirect_url: existing.snap_redirect_url });
  const snap = await createSnapTransaction(id);
  const { data: payment, error } = await supabaseAdmin.from('payments').upsert({ order_id: id, provider: 'midtrans', provider_order_id: snap.providerOrderId, snap_token: snap.token, snap_redirect_url: snap.redirectUrl, status: 'PENDING', raw_response: snap.raw }, { onConflict: 'order_id' }).select('snap_token,snap_redirect_url').single();
  if (error || !payment) return NextResponse.json({ error: error?.message ?? 'Payment create failed' }, { status: 500 });
  return NextResponse.json({ token: payment.snap_token, redirect_url: payment.snap_redirect_url });
}
