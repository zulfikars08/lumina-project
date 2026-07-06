import { existsSync, readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '../src/lib/auth/password-core';

function loadDotEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

async function upsertUser(email: string, name: string, password: string, roleCode: 'ADMIN' | 'CUSTOMER') {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: role, error: roleError } = await supabase.from('roles').select('id').eq('code', roleCode).single();
  if (roleError || !role) throw new Error(roleError?.message ?? `${roleCode} role not found`);
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  const payload = { email, name, password_hash: hashPassword(password), status: 'ACTIVE', password_changed_at: new Date().toISOString() };
  const result = existing?.id
    ? await supabase.from('users').update(payload).eq('id', existing.id).select('id').single()
    : await supabase.from('users').insert(payload).select('id').single();
  if (result.error || !result.data) throw new Error(result.error?.message ?? 'failed');
  await supabase.from('user_roles').upsert({ user_id: result.data.id, role_id: role.id });
  console.log(`${roleCode} ready: ${email}`);
}

async function main() {
  loadDotEnv();
  await upsertUser('admin-runtime@example.com', 'Runtime Admin', 'LuminaAdmin123!', 'ADMIN');
  await upsertUser('customer-runtime@example.com', 'Runtime Customer', 'LuminaCustomer123!', 'CUSTOMER');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
