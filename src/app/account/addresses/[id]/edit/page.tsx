import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { Alert, Button, Card, Field, PageHeader } from '@/components/ui';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { saveAddress } from '@/lib/customer/actions';

export default async function EditAddressPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const { data: address } = await supabaseAdmin.from('addresses').select('*').eq('id', id).eq('user_id', user.id).single();
  if (!address) notFound();
  return <><StoreHeader /><AccountShell user={user}><div className="space-y-6"><PageHeader eyebrow="Account" title="Edit address" description="Update shipping recipient and location details." />{query.error ? <Alert tone="warning">Please check required fields, phone, and postal code.</Alert> : null}<Card><form action={saveAddress} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="id" value={address.id} />{(['recipient_name','phone','province','city','district','postal_code'] as const).map((name) => <Field key={name} label={name.replace('_',' ')}><input name={name} defaultValue={address[name] ?? ''} required /></Field>)}<Field label="full address"><textarea name="full_address" defaultValue={address.full_address ?? ''} required /></Field><Field label="notes"><input name="notes" defaultValue={address.notes ?? ''} /></Field><label className="flex items-center gap-2 text-sm theme-text"><input type="checkbox" name="is_default" defaultChecked={address.is_default} /> Default address</label><div className="flex flex-wrap gap-3 md:col-span-2"><Button>Save changes</Button><Link href="/account/addresses" className="rounded-full px-6 py-3 theme-button-soft">Cancel</Link></div></form></Card></div></AccountShell><StoreFooter /></>;
}
