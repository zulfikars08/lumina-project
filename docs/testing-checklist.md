# Testing checklist

## Pre-flight

```bash
npm run lint
npm run build
```

## Auth and RBAC

- Customer login works.
- Super Admin login works.
- Admin menu shows allowed modules.
- Customers cannot access admin pages.

## Storefront

- Products list loads.
- Product detail loads.
- Product images render.

## Account

- Profile update persists.
- Address create/edit/default works.
- Other-user address edit is blocked.

## Wishlist

- Add wishlist item.
- Duplicate add keeps one row.
- Remove wishlist item.

## Cart

- Add item.
- Update quantity.
- Above-stock update shows friendly error.
- Remove item.
- Clear cart.

## Checkout

- Logged out checkout redirects to login.
- Empty cart redirects to cart.
- Address required UI appears.
- Voucher valid/invalid/minimum purchase paths work.
- Order creates `PENDING_PAYMENT`.
- Cart clears after order.
- Stock reduces once.
- Inventory log is created.

## Orders

- Order list shows created order.
- Owner can view order detail.
- Other customer gets 404/notFound.
- Invoice draft displays current order status.

## Midtrans Sandbox

- Pay route returns Snap token.
- Payment row stores pending status.
- Manual status check maps success to `PAID`.
- Repeated status check is idempotent.
- Server key is never exposed to frontend.
