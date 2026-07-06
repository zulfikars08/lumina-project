import { login } from '@/lib/auth/actions';

export default function LoginPage() {
  async function action(formData: FormData) { 'use server'; await login({ email: String(formData.get('email') ?? ''), password: String(formData.get('password') ?? '') }); }
  return <main><h1>Login</h1><form action={action}><input name="email" type="email" placeholder="Email" required /><input name="password" type="password" placeholder="Password" required /><button>Login</button></form></main>;
}
