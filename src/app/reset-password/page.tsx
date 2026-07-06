import { resetPassword } from '@/lib/auth/actions';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  async function action(formData: FormData) { 'use server'; await resetPassword({ token: String(formData.get('token') ?? ''), password: String(formData.get('password') ?? '') }); }
  return <main><h1>Reset password</h1><form action={action}><input name="token" defaultValue={token} placeholder="Token from link" required /><input name="password" type="password" minLength={10} placeholder="New password" required /><button>Reset password</button></form></main>;
}
