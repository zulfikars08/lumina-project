import { changeCurrentPassword } from '@/lib/auth/actions';
import { currentUser } from '@/lib/auth/rbac';
import { redirect } from 'next/navigation';

export default async function ChangePasswordPage() {
  const user = await currentUser();
  if (!user) redirect('/login');
  async function action(formData: FormData) { 'use server'; await changeCurrentPassword({ password: String(formData.get('password') ?? '') }); }
  return <main><h1>Change password</h1><form action={action}><input name="password" type="password" minLength={10} placeholder="New password" required /><button>Change password</button></form></main>;
}
