import 'server-only';

import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export type RoleCode = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  status: 'PENDING_PASSWORD_CHANGE' | 'ACTIVE' | 'SUSPENDED';
  roles: RoleCode[];
  permissions: string[];
};

export async function currentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id,email,name,status,user_roles(roles(code,role_permissions(permissions(code))))')
    .eq('id', session.userId)
    .single();

  if (error || !user) return null;

  const userRoles = (user.user_roles ?? []) as unknown as Array<{ roles: { code: RoleCode; role_permissions: Array<{ permissions: { code: string } | { code: string }[] }> } | { code: RoleCode; role_permissions: Array<{ permissions: { code: string } | { code: string }[] }> }[] }>;
  const roleRows = userRoles.map((item) => Array.isArray(item.roles) ? item.roles[0] : item.roles).filter(Boolean);
  const roles = roleRows.map((role) => role.code);
  const permissions = roles.includes('SUPER_ADMIN')
    ? ['*']
    : Array.from(new Set(roleRows.flatMap((role) => role.role_permissions.map((rp) => Array.isArray(rp.permissions) ? rp.permissions[0]?.code : rp.permissions.code).filter(Boolean))));

  return { id: user.id, email: user.email, name: user.name, status: user.status, roles, permissions };
}

export function hasPermission(user: AuthUser, permission: string) {
  return user.permissions.includes('*') || user.permissions.includes(permission);
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.status === 'PENDING_PASSWORD_CHANGE') redirect('/change-password');
  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireUser();
  if (!hasPermission(user, permission)) redirect('/403');
  return user;
}
