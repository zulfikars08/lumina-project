import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { applyMidtransStatus, verifySignature } from '@/lib/payment/midtrans';

export async function POST(request: NextRequest) {
  const body = await request.json();
  await supabaseAdmin.from('midtrans_notifications').insert({ provider_order_id: body.order_id, transaction_status: body.transaction_status, fraud_status: body.fraud_status, payload: body });
  if (!verifySignature(body)) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  const result = await applyMidtransStatus(body);
  return NextResponse.json({ ok: true, ...result });
}
