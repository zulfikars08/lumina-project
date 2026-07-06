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

async function main() {
  loadDotEnv();
  const [emailArg, nameArg, passwordArg] = process.argv.slice(2);
  const email = emailArg ?? process.env.BOOTSTRAP_ADMIN_EMAIL;
  const name = nameArg ?? process.env.BOOTSTRAP_ADMIN_NAME ?? 'Super Admin';
  const password = passwordArg ?? process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (process.env.NODE_ENV === 'production') throw new Error('Refusing to bootstrap SUPER_ADMIN in production.');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Supabase env.');
  if (!email || !password) throw new Error('Usage: npm run bootstrap:super-admin -- email name password');
  if (password.length < 10) throw new Error('Password must be at least 10 characters.');

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: role, error: roleError } = await supabase.from('roles').select('id').eq('code', 'SUPER_ADMIN').single();
  if (roleError || !role) throw new Error(`SUPER_ADMIN role not found. Run migrations first. ${roleError?.message ?? ''}`);

  const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).maybeSingle();
  const result = existing?.id
    ? await supabase.from('users').update({ name, password_hash: hashPassword(password), status: 'ACTIVE', password_changed_at: new Date().toISOString() }).eq('id', existing.id).select('id').single()
    : await supabase.from('users').insert({ email: email.toLowerCase(), name, password_hash: hashPassword(password), status: 'ACTIVE', password_changed_at: new Date().toISOString() }).select('id').single();

  if (result.error || !result.data) throw new Error(result.error?.message ?? 'Failed creating admin.');
  await supabase.from('user_roles').upsert({ user_id: result.data.id, role_id: role.id });
  console.log(`SUPER_ADMIN ready: ${email.toLowerCase()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
