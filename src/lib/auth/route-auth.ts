import 'server-only';

import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { parseSessionToken } from '@/lib/auth/session';
import { type AuthUser, type RoleCode } from '@/lib/auth/rbac';

const COOKIE = 'lumina_session';

export async function currentRouteUser(request: NextRequest): Promise<AuthUser | null> {
  const session = parseSessionToken(request.cookies.get(COOKIE)?.value);
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

export async function requireRouteUser(request: NextRequest) {
  const user = await currentRouteUser(request);
  if (!user) redirect('/login');
  if (user.status === 'PENDING_PASSWORD_CHANGE') redirect('/change-password');
  return user;
}

