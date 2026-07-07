import { StoreFooter, StoreHeader } from '@/components/storefront';
import { AccountShell } from '@/components/account-shell';
import { requireUser } from '@/lib/auth/rbac';
import { supabaseAdmin } from '@/lib/supabase/server';
import { clearCart, removeCartItem, updateCartQuantity } from '@/lib/customer/actions';
import { ProductImage } from '@/components/product-image';
import { Alert, Button, ButtonLink, Card, EmptyState, PageHeader } from '@/components/ui';

export default async function CartPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const { data: cart } = await supabaseAdmin.from('carts').select('id').eq('user_id', user.id).maybeSingle();
  const { data: items } = cart
    ? await supabaseAdmin.from('cart_items').select('id,quantity,products(id,name,slug,price,discount_price,stock,product_images(file_path,is_primary,alt_text,sort_order)),product_variants(id,name,sku,price,discount_price,stock)').eq('cart_id', cart.id)
    : { data: [] };
  const total = (items ?? []).reduce((sum, item) => {
    const p = Array.isArray(item.products) ? item.products[0] : item.products;
    const v = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
    return sum + Number(v?.discount_price ?? v?.price ?? p?.discount_price ?? p?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <>
      <StoreHeader />
      <AccountShell user={user}>
        <div className="space-y-6">
          <PageHeader eyebrow="Account" title="Cart" description="Review items, quantity, and totals before checkout." />
          {params.error === 'stock' ? <Alert tone="warning">Quantity exceeds available stock.</Alert> : null}
          {items?.length ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-4">
                {items.map((item) => {
                  const p = Array.isArray(item.products) ? item.products[0] : item.products;
                  const v = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
                  const img = [...(p?.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))[0];
                  const price = Number(v?.discount_price ?? v?.price ?? p?.discount_price ?? p?.price ?? 0);
                  return (
                    <Card key={item.id} className="grid gap-4 md:grid-cols-[96px_1fr_auto]">
                      <ProductImage path={img?.file_path} alt={p?.name ?? 'Product'} className="aspect-square" />
                      <div>
                        <p className="font-medium theme-heading">{p?.name}</p>
                        {v ? <p className="text-sm theme-text-muted">{v.name} · {v.sku}</p> : null}
                        <p className="text-sm theme-text-muted">Rp {price.toLocaleString('id-ID')}</p>
                        <p className="text-sm theme-text-muted">Subtotal Rp {(price * item.quantity).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <form action={updateCartQuantity} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={item.id} />
                          <input name="quantity" type="number" min="1" defaultValue={item.quantity} className="w-20 rounded-full bg-[var(--surface-muted)] px-3 py-2" />
                          <Button variant="secondary" size="sm">Update</Button>
                        </form>
                        <form action={removeCartItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button variant="ghost" size="sm">Remove</Button>
                        </form>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <Card className="h-fit bg-[var(--surface-muted)]">
                <h2 className="text-xl font-semibold theme-heading">Cart summary</h2>
                <div className="mt-4 grid gap-2 text-sm">
                  <p className="flex justify-between"><span>Subtotal</span><span>Rp {total.toLocaleString('id-ID')}</span></p>
                  <p className="flex justify-between"><span>Shipping</span><span>Rp 0</span></p>
                  <p className="flex justify-between border-t pt-3 font-semibold theme-border theme-heading"><span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span></p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <form action={clearCart}><Button variant="secondary">Clear cart</Button></form>
                  <ButtonLink href="/checkout">Checkout</ButtonLink>
                </div>
              </Card>
            </div>
          ) : (
            <EmptyState icon="Bag" title="Your cart is empty" description="Add products before checkout." action={<ButtonLink href="/products">Shop products</ButtonLink>} />
          )}
        </div>
      </AccountShell>
      <StoreFooter />
    </>
  );
}
