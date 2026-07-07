import Link from 'next/link';
import { resetPassword } from '@/lib/auth/actions';
import { AuthShell, authForm, authInput, authLabel } from '@/components/auth-card';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  async function action(formData: FormData) { 'use server'; await resetPassword({ token: String(formData.get('token') ?? ''), password: String(formData.get('password') ?? '') }); }
  return <AuthShell title="Reset password" subtitle="Choose a new password for your Lumina account."><form action={action} className={authForm}><label className={authLabel}>Token<input className={authInput} name="token" defaultValue={token} placeholder="Token from link" required /></label><label className={authLabel}>New password<input className={authInput} name="password" type="password" minLength={10} placeholder="Minimum 10 characters" required /></label><button className="rounded-full px-6 py-3 theme-button">Reset password</button></form><p className="mt-5 text-sm"><Link className="theme-brand" href="/login">Back to login</Link></p></AuthShell>;
}
