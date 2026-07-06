import { requestPasswordReset } from '@/lib/auth/actions';

export default function ForgotPasswordPage() {
  async function action(formData: FormData) { 'use server'; await requestPasswordReset(String(formData.get('email') ?? '')); }
  return <main><h1>Forgot password</h1><form action={action}><input name="email" type="email" placeholder="Email" required /><button>Send reset link</button></form></main>;
}
