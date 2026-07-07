import { StoreFooter, StoreHeader, ProductCard } from '@/components/storefront';
import { ButtonLink, EmptyState, PageHeader } from '@/components/ui';
import { AccountShell } from '@/components/account-shell';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function WishlistPage(){
  const user=await requireUser();
  const {data:items}=await supabaseAdmin.from('wishlists').select('product_id,products(id,name,slug,price,discount_price,categories(name,slug),product_images(file_path,is_primary,alt_text,sort_order))').eq('user_id',user.id);
  return <><StoreHeader/><AccountShell user={user}><PageHeader eyebrow="Account" title="Wishlist" description="Saved products for your next Lumina ritual." />{items?.length?<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((item)=>{const product=Array.isArray(item.products)?item.products[0]:item.products; if(!product)return null; return <div key={item.product_id}><ProductCard product={product}/><form action="/wishlist/remove" method="post" className="mt-2"><input type="hidden" name="product_id" value={item.product_id}/><button className="rounded-full px-4 py-2 text-sm theme-button-soft">Remove</button></form></div>})}</div>:<div className="mt-6"><EmptyState icon="♡" title="Your wishlist is empty" description="Save products you want to revisit later." action={<ButtonLink href="/products">Browse products</ButtonLink>} /></div>}</AccountShell><StoreFooter/></>;
}
