import { NextRequest, NextResponse } from 'next/server';
import { requireRouteUser } from '@/lib/auth/route-auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { applyMidtransStatus, getMidtransStatus } from '@/lib/payment/midtrans';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRouteUser(request);
  const { id } = await params;
  const { data: order } = await supabaseAdmin.from('orders').select('id').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  const { data: payment } = await supabaseAdmin.from('payments').select('provider_order_id').eq('order_id', id).maybeSingle();
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  const status = await getMidtransStatus(payment.provider_order_id);
  const result = await applyMidtransStatus(status);
  return NextResponse.json(result);
}
