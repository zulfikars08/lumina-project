import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth/actions';
import { AuthShell, authForm, authInput, authLabel } from '@/components/auth-card';

export default function ForgotPasswordPage() {
  async function action(formData: FormData) { 'use server'; await requestPasswordReset(String(formData.get('email') ?? '')); }
  return <AuthShell title="Forgot password" subtitle="Send a reset link to your email."><form action={action} className={authForm}><label className={authLabel}>Email<input className={authInput} name="email" type="email" placeholder="you@example.com" required /></label><button className="rounded-full px-6 py-3 theme-button">Send reset link</button></form><p className="mt-5 text-sm"><Link className="theme-brand" href="/login">Back to login</Link></p></AuthShell>;
}
