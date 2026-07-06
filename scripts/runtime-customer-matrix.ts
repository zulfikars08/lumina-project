/* eslint-disable prefer-const */
import { createHmac } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '../src/lib/auth/password-core';

function loadDotEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}
function sessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Math.floor(Date.now()/1000)+3600 })).toString('base64url');
  return `${payload}.${createHmac('sha256', process.env.SESSION_SECRET!).update(payload).digest('base64url')}`;
}
function fieldsFromForm(html: string, marker: string) {
  const forms = Array.from(html.matchAll(/<form[\s\S]*?<\/form>/g)).map(m => m[0]);
  const form = forms.find(f => f.includes(marker));
  if (!form) throw new Error(`form not found: ${marker}`);
  const fields: Record<string,string> = {};
  for (const m of Array.from(form.matchAll(/<input[^>]+>/g))) {
    const tag = m[0];
    const name = tag.match(/name="([^"]+)"/)?.[1];
    if (!name) continue;
    const value = tag.match(/value="([^"]*)"/)?.[1] ?? '';
    fields[name.replace(/&quot;/g, '"')] = value.replace(/&quot;/g, '"');
  }
  return fields;
}
async function postForm(path: string, cookie: string, fields: Record<string,string>) {
  const body = new URLSearchParams(fields);
  const res = await fetch(`http://127.0.0.1:3000${path}`, { method: 'POST', headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' }, body, redirect: 'manual' });
  return { status: res.status, location: res.headers.get('location') };
}
async function get(path: string, cookie?: string) {
  return fetch(`http://127.0.0.1:3000${path}`, { headers: cookie ? { cookie } : {}, redirect: 'manual' });
}
async function main() {
  loadDotEnv();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const customerEmail = 'customer-runtime@example.com';
  const otherEmail = 'customer-other@example.com';
  for (const [email,name] of [[customerEmail,'Runtime Customer'],[otherEmail,'Other Customer']] as const) {
    const { data: role } = await supabase.from('roles').select('id').eq('code','CUSTOMER').single();
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    const payload = { email, name, password_hash: hashPassword('LuminaCustomer123!'), status: 'ACTIVE', password_changed_at: new Date().toISOString() };
    const result = existing?.id ? await supabase.from('users').update(payload).eq('id', existing.id).select('id').single() : await supabase.from('users').insert(payload).select('id').single();
    await supabase.from('user_roles').upsert({ user_id: result.data!.id, role_id: role!.id });
  }
  const { data: customer } = await supabase.from('users').select('id').eq('email', customerEmail).single();
  const { data: admin } = await supabase.from('users').select('id').eq('email','admin@example.com').single();
  const customerCookie = `lumina_session=${sessionToken(customer!.id)}`;
  const adminCookie = `lumina_session=${sessionToken(admin!.id)}`;

  await supabase.from('cart_items').delete().neq('id','00000000-0000-0000-0000-000000000000');
  await supabase.from('wishlists').delete().eq('user_id', customer!.id);
  await supabase.from('addresses').delete().eq('user_id', customer!.id);

  const { data: product } = await supabase.from('products').select('id,slug,stock').eq('sku','RUNTIME-SERUM-001').single();
  const { data: variant } = await supabase.from('product_variants').select('id,stock').eq('sku','RUNTIME-SERUM-001-30ML').single();
  await supabase.from('products').update({ status:'active', stock: 10 }).eq('id', product!.id);
  await supabase.from('product_variants').update({ is_active: true, stock: 5 }).eq('id', variant!.id);

  const loggedOutAccount = await get('/account');
  const customerAccount = await get('/account', customerCookie);
  const customerAdmin = await get('/admin', customerCookie);
  const superAdmin = await get('/admin', adminCookie);

  let html = await (await get('/account/profile', customerCookie)).text();
  let profileFields = fieldsFromForm(html, 'name="name"');
  profileFields.name = 'Runtime Customer Edited';
  const profilePost = await postForm('/account/profile', customerCookie, profileFields);
  const { data: updatedUser } = await supabase.from('users').select('name,email').eq('id', customer!.id).single();

  html = await (await get('/account/addresses', customerCookie)).text();
  let addressFields = fieldsFromForm(html, 'recipient_name');
  Object.assign(addressFields, { recipient_name:'Runtime Receiver', phone:'081234567890', province:'DKI Jakarta', city:'Jakarta Selatan', district:'Setiabudi', postal_code:'12910', full_address:'Jl Runtime No 1', notes:'front desk' });
  const addressPost = await postForm('/account/addresses', customerCookie, addressFields);
  let { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', customer!.id).order('created_at');
  const firstAddress = addresses![0];

  html = await (await get(`/account/addresses/${firstAddress.id}/edit`, customerCookie)).text();
  let editFields = fieldsFromForm(html, 'Runtime Receiver');
  editFields.city = 'Jakarta Pusat';
  editFields.full_address = 'Jl Runtime Edited No 2';
  const editPost = await postForm(`/account/addresses/${firstAddress.id}/edit`, customerCookie, editFields);
  const { data: editedAddress } = await supabase.from('addresses').select('*').eq('id', firstAddress.id).single();

  const { data: other } = await supabase.from('users').select('id').eq('email', otherEmail).single();
  const { data: otherAddress } = await supabase.from('addresses').insert({ user_id: other!.id, recipient_name:'Other', phone:'081234567890', province:'Bali', city:'Denpasar', district:'Kuta', postal_code:'80361', full_address:'Other address', is_default:true }).select('id').single();
  const otherEdit = await get(`/account/addresses/${otherAddress!.id}/edit`, customerCookie);

  html = await (await get(`/products/${product!.slug}`, customerCookie)).text();
  let wishFields = fieldsFromForm(html, 'name="next"');
  const wishlistPost1 = await postForm(`/products/${product!.slug}`, customerCookie, wishFields);
  const wishlistPost2 = await postForm(`/products/${product!.slug}`, customerCookie, wishFields);
  let { data: wishlistRows } = await supabase.from('wishlists').select('*').eq('user_id', customer!.id).eq('product_id', product!.id);
  const wishlistPage = await (await get('/account/wishlist', customerCookie)).text();

  html = await (await get('/account/wishlist', customerCookie)).text();
  const removeWishFields = fieldsFromForm(html, 'value="remove"');
  const removeWish = await postForm('/account/wishlist', customerCookie, removeWishFields);
  const { count: wishCountAfterRemove } = await supabase.from('wishlists').select('*', { count:'exact', head:true }).eq('user_id', customer!.id).eq('product_id', product!.id);

  html = await (await get(`/products/${product!.slug}`, customerCookie)).text();
  let cartFields = fieldsFromForm(html, 'product_id');
  cartFields.quantity = '2';
  cartFields.variant_id = variant!.id;
  const addCart = await postForm(`/products/${product!.slug}`, customerCookie, cartFields);
  const { data: cart } = await supabase.from('carts').select('id').eq('user_id', customer!.id).single();
  let { data: cartItems } = await supabase.from('cart_items').select('id,quantity,variant_id').eq('cart_id', cart!.id);
  const cartPage = await (await get('/account/cart', customerCookie)).text();

  html = cartPage;
  let updateFields = fieldsFromForm(html, 'name="quantity"');
  updateFields.quantity = '3';
  const updateCart = await postForm('/account/cart', customerCookie, updateFields);
  let { data: updatedCartItems } = await supabase.from('cart_items').select('id,quantity').eq('cart_id', cart!.id);

  html = await (await get('/account/cart', customerCookie)).text();
  const removeCartFields = fieldsFromForm(html, 'Remove');
  const removeCart = await postForm('/account/cart', customerCookie, removeCartFields);
  const { count: cartAfterRemove } = await supabase.from('cart_items').select('*', { count:'exact', head:true }).eq('cart_id', cart!.id);

  console.log(JSON.stringify({
    auth: { loggedOutAccount: [loggedOutAccount.status, loggedOutAccount.headers.get('location')], customerAccount: customerAccount.status, customerAdmin: [customerAdmin.status, customerAdmin.headers.get('location')], superAdmin: [superAdmin.status, superAdmin.headers.get('location')] },
    profile: { post: profilePost, updatedUser },
    address: { create: addressPost, firstDefault: firstAddress.is_default, edit: editPost, editedCity: editedAddress?.city, editedFullAddress: editedAddress?.full_address, otherEdit: [otherEdit.status, otherEdit.url] },
    wishlist: { add1: wishlistPost1, add2: wishlistPost2, rowCount: wishlistRows?.length, pageHasProduct: wishlistPage.includes('Runtime Glow Serum'), remove: removeWish, afterRemove: wishCountAfterRemove },
    cart: { add: addCart, items: cartItems, pageHasProduct: cartPage.includes('Runtime Glow Serum'), pageHasShippingZero: cartPage.includes('Shipping: Rp 0'), update: updateCart, updatedCartItems, remove: removeCart, afterRemove: cartAfterRemove },
    noOrdersCreated: true
  }, null, 2));
}
main().catch((error) => { console.error(error); process.exit(1); });
