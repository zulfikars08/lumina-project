import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { applyMidtransStatus, verifySignature } from '@/lib/payment/midtrans';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!verifySignature(body)) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  await supabaseAdmin.from('midtrans_notifications').insert({ provider_order_id: body.order_id, transaction_status: body.transaction_status, fraud_status: body.fraud_status, payload: body });
  const result = await applyMidtransStatus(body);
  return NextResponse.json({ ok: true, ...result });
}
