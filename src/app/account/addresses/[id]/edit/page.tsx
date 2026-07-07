import { notFound } from 'next/navigation';
import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { saveAddress } from '@/lib/customer/actions';

export default async function EditAddressPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const { data: address } = await supabaseAdmin.from('addresses').select('*').eq('id', id).eq('user_id', user.id).single();
  if (!address) notFound();
  return <><StoreHeader /><AccountShell user={user}><h2 className="text-2xl font-semibold theme-heading">Edit address</h2>{query.error ? <p className="mt-3 rounded-2xl bg-[var(--surface-muted)] p-3 text-sm theme-brand">Please check required fields, phone, and postal code.</p> : null}<form action={saveAddress} className="mt-6 grid gap-3 md:grid-cols-2"><input type="hidden" name="id" value={address.id} />{(['recipient_name','phone','province','city','district','postal_code'] as const).map((name) => <label key={name} className="text-sm theme-text-muted">{name.replace('_',' ')}<input name={name} defaultValue={address[name] ?? ''} required className="mt-1 w-full rounded-full bg-[var(--surface-muted)] px-4 py-3" /></label>)}<label className="text-sm theme-text-muted md:col-span-2">full address<textarea name="full_address" defaultValue={address.full_address ?? ''} required className="mt-1 w-full rounded-3xl bg-[var(--surface-muted)] px-4 py-3" /></label><label className="text-sm theme-text-muted md:col-span-2">notes<input name="notes" defaultValue={address.notes ?? ''} className="mt-1 w-full rounded-full bg-[var(--surface-muted)] px-4 py-3" /></label><label><input type="checkbox" name="is_default" defaultChecked={address.is_default} /> Default</label><button className="rounded-full px-6 py-3 theme-button">Save changes</button></form></AccountShell><StoreFooter /></>;
}
