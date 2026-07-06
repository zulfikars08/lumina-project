import { createHmac } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadDotEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

function sessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const sig = createHmac('sha256', process.env.SESSION_SECRET!).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

async function main() {
  loadDotEnv();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: user } = await supabase.from('users').select('id').eq('email', 'admin@example.com').single();
  const { data: product } = await supabase.from('products').select('id').eq('sku', 'RUNTIME-SERUM-001').single();
  if (!user || !product) throw new Error('missing user/product');

  const cookie = `lumina_session=${sessionToken(user.id)}`;
  for (const name of ['tmp-runtime.png', 'tmp-runtime-2.png']) {
    const form = new FormData();
    const bytes = readFileSync(name === 'tmp-runtime.png' ? './tmp-runtime.png' : './tmp-runtime-2.png');
    form.append('image', new File([bytes], name, { type: 'image/png' }));
    const res = await fetch(`http://localhost:3000/admin/products/${product.id}/images`, { method: 'POST', headers: { cookie }, body: form, redirect: 'manual' });
    console.log(`upload ${name}:`, res.status, res.headers.get('location'));
  }

  const { data: images } = await supabase.from('product_images').select('id,file_path,is_primary').eq('product_id', product.id).order('created_at');
  console.log('images after upload:', images?.length, images?.map((i) => ({ id: i.id, primary: i.is_primary, path: i.file_path })));
  if (!images || images.length < 2) return;

  const primaryRes = await fetch(`http://localhost:3000/admin/products/${product.id}/images/${images[1].id}/primary`, { method: 'POST', headers: { cookie }, redirect: 'manual' });
  console.log('set primary:', primaryRes.status, primaryRes.headers.get('location'));

  const deleteRes = await fetch(`http://localhost:3000/admin/products/${product.id}/images/${images[0].id}`, { method: 'POST', headers: { cookie }, redirect: 'manual' });
  console.log('delete first:', deleteRes.status, deleteRes.headers.get('location'));

  const { data: finalImages } = await supabase.from('product_images').select('id,file_path,is_primary').eq('product_id', product.id).order('created_at');
  console.log('images final:', finalImages?.length, finalImages?.map((i) => ({ id: i.id, primary: i.is_primary, path: i.file_path })));
}

main().catch((error) => { console.error(error); process.exit(1); });
