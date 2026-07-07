import Link from 'next/link';
import { signUpCustomer } from '@/lib/auth/actions';
import { AuthShell, authForm, authInput, authLabel } from '@/components/auth-card';

export default function SignUpPage() {
  async function action(formData: FormData) { 'use server'; await signUpCustomer({ name: String(formData.get('name') ?? ''), email: String(formData.get('email') ?? '') }); }
  return <AuthShell title="Create account" subtitle="Start your Lumina routine."><form action={action} className={authForm}><label className={authLabel}>Name<input className={authInput} name="name" placeholder="Your name" required /></label><label className={authLabel}>Email<input className={authInput} name="email" type="email" placeholder="you@example.com" required /></label><button className="rounded-full px-6 py-3 theme-button">Send temporary password</button></form><p className="mt-5 text-sm theme-text-muted">Already have an account? <Link className="theme-brand" href="/login">Login</Link></p></AuthShell>;
}
