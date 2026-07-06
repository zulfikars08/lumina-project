'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { clearSession, setSession } from '@/lib/auth/session';
import { currentUser } from '@/lib/auth/rbac';
import { generateResetToken, generateTemporaryPassword, hashPassword, hashToken, verifyPassword } from '@/lib/auth/password';
import { emailProvider } from '@/lib/email/provider';
import { resetPasswordEmail, temporaryPasswordEmail } from '@/lib/email/templates';
import { rateLimit } from '@/lib/rate-limit';

const emailSchema = z.string().trim().email().toLowerCase();
const passwordSchema = z.string().min(10, 'Password must be at least 10 characters.').max(128);

export async function signUpCustomer(input: { name: string; email: string }) {
  const data = z.object({ name: z.string().trim().min(2).max(120), email: emailSchema }).parse(input);
  await rateLimit(`sign-up:${data.email}`, 3, 60 * 60 * 1000);
  const tempPassword = generateTemporaryPassword();
  const { data: role } = await supabaseAdmin.from('roles').select('id').eq('code', 'CUSTOMER').single();

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      name: data.name,
      email: data.email,
      password_hash: hashPassword(tempPassword),
      temp_password_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
    .select('id')
    .single();
  if (error) throw new Error(error.code === '23505' ? 'Email is already registered.' : error.message);
  if (role) await supabaseAdmin.from('user_roles').insert({ user_id: user.id, role_id: role.id });

  const message = temporaryPasswordEmail(data.name, tempPassword);
  await emailProvider().send({ to: data.email, ...message });
}

export async function login(input: { email: string; password: string }) {
  const data = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).parse(input);
  await rateLimit(`login:${data.email}`, 5, 15 * 60 * 1000);
  const { data: user } = await supabaseAdmin.from('users').select('id,password_hash,status,temp_password_expires_at').eq('email', data.email).single();
  if (!user || !verifyPassword(data.password, user.password_hash)) throw new Error('Invalid email or password.');
  if (user.status === 'SUSPENDED') throw new Error('Account suspended.');
  if (user.status === 'PENDING_PASSWORD_CHANGE' && (!user.temp_password_expires_at || new Date(user.temp_password_expires_at) < new Date())) {
    throw new Error('Temporary password expired. Use forgot password to get a new link.');
  }
  await supabaseAdmin.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);
  await setSession(user.id);
  redirect(user.status === 'PENDING_PASSWORD_CHANGE' ? '/change-password' : '/account');
}

export async function changeCurrentPassword(input: { password: string }) {
  const user = await currentUser();
  if (!user) redirect('/login');
  await rateLimit(`change-password:${user.id}`, 5, 15 * 60 * 1000);
  const password = passwordSchema.parse(input.password);
  await supabaseAdmin
    .from('users')
    .update({ password_hash: hashPassword(password), status: 'ACTIVE', password_changed_at: new Date().toISOString(), temp_password_expires_at: null })
    .eq('id', user.id);
  redirect('/account');
}

export async function requestPasswordReset(emailInput: string) {
  const email = emailSchema.parse(emailInput);
  await rateLimit(`forgot-password:${email}`, 3, 60 * 60 * 1000);
  const { data: user } = await supabaseAdmin.from('users').select('name,email').eq('email', email).maybeSingle();
  if (!user) return;
  const resetToken = generateResetToken();
  await supabaseAdmin
    .from('users')
    .update({ reset_token_hash: hashToken(resetToken), reset_token_expires_at: new Date(Date.now() + 1000 * 60 * 30).toISOString() })
    .eq('email', email);
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  await emailProvider().send({ to: email, ...resetPasswordEmail(user.name, link) });
}

export async function resetPassword(input: { token: string; password: string }) {
  const data = z.object({ token: z.string().min(20), password: passwordSchema }).parse(input);
  const tokenHash = hashToken(data.token);
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id,reset_token_expires_at')
    .eq('reset_token_hash', tokenHash)
    .maybeSingle();
  if (!user || !user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date()) throw new Error('Reset link is invalid or expired.');
  await rateLimit(`reset-password:${user.id}`, 5, 15 * 60 * 1000);
  await supabaseAdmin
    .from('users')
    .update({ password_hash: hashPassword(data.password), status: 'ACTIVE', password_changed_at: new Date().toISOString(), reset_token_hash: null, reset_token_expires_at: null, temp_password_expires_at: null })
    .eq('id', user.id);
  redirect('/login');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}
