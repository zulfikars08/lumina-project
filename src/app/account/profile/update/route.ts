import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRouteUser } from '@/lib/auth/route-auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const user = await requireRouteUser(request);
  const form = await request.formData();
  const parsed = z.string().trim().min(2).max(120).safeParse(form.get('name'));
  if (!parsed.success) return NextResponse.redirect(new URL('/account/profile?error=name', request.url));
  const { error } = await supabaseAdmin.from('users').update({ name: parsed.data, updated_at: new Date().toISOString() }).eq('id', user.id);
  return NextResponse.redirect(new URL(`/account/profile?${error ? 'error=save' : 'status=profile-updated'}`, request.url));
}
