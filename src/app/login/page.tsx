import Link from 'next/link';
import { login } from '@/lib/auth/actions';
import { AuthShell, authForm, authInput, authLabel } from '@/components/auth-card';

export default function LoginPage() {
  async function action(formData: FormData) { 'use server'; await login({ email: String(formData.get('email') ?? ''), password: String(formData.get('password') ?? '') }); }
  return <AuthShell title="Login" subtitle="Access your Lumina account."><form action={action} className={authForm}><label className={authLabel}>Email<input className={authInput} name="email" type="email" placeholder="you@example.com" required /></label><label className={authLabel}>Password<input className={authInput} name="password" type="password" placeholder="Password" required /></label><button className="rounded-full px-6 py-3 theme-button">Login</button></form><div className="mt-5 flex justify-between text-sm theme-text-muted"><Link className="theme-brand" href="/forgot-password">Forgot password?</Link><Link className="theme-brand" href="/sign-up">Create account</Link></div></AuthShell>;
}
