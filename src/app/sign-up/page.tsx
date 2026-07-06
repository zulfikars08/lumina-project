import { signUpCustomer } from '@/lib/auth/actions';

export default function SignUpPage() {
  async function action(formData: FormData) { 'use server'; await signUpCustomer({ name: String(formData.get('name') ?? ''), email: String(formData.get('email') ?? '') }); }
  return <main><h1>Sign up</h1><form action={action}><input name="name" placeholder="Name" required /><input name="email" type="email" placeholder="Email" required /><button>Send temporary password</button></form></main>;
}
