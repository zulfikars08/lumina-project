import { logout } from '@/lib/auth/actions';

export default function LogoutPage() {
  return <main><form action={logout}><button>Logout</button></form></main>;
}
