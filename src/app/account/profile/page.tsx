import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { Alert, Button, Card, Field, PageHeader, StatusBadge } from '@/components/ui';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const { data: row } = await supabaseAdmin.from('users').select('password_changed_at,status').eq('id', user.id).single();
  return <><StoreHeader /><AccountShell user={user}><div className="space-y-6"><PageHeader eyebrow="Account" title="Profile" description="Keep your Lumina account details up to date." action={<StatusBadge status={row?.status} />} />{params.status ? <Alert tone="success">Profile updated.</Alert> : null}<Card><form action="/account/profile/update" method="post" className="grid gap-4 md:grid-cols-2"><Field label="Name"><input name="name" defaultValue={user.name} required /></Field><Field label="Email"><input value={user.email} readOnly /></Field><p className="text-sm theme-text-muted md:col-span-2">Password changed: {row?.password_changed_at ? 'yes' : 'not yet'}</p><Button>Save profile</Button></form></Card></div></AccountShell><StoreFooter /></>;
}
