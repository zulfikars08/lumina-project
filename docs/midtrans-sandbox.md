# Midtrans Sandbox

Lumina currently supports Midtrans Snap Sandbox foundation only.

## Environment

```env
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_NOTIFICATION_URL=
APP_URL=http://127.0.0.1:3000
```

Rules:

- Use Sandbox keys only.
- `MIDTRANS_SERVER_KEY` is server-only.
- Only `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` is exposed to the browser.

## Implemented

- Snap transaction creation from DB order data.
- Payment row creation/reuse.
- Snap token and redirect URL storage.
- Pay Now UI with Sandbox Snap JS.
- Manual payment status check route.
- Status mapping to order/payment states.

## Not finished

- Public URL webhook runtime test.
- Production mode.
- Receipt email delivery.

## Manual test flow

1. Create checkout order.
2. Open order detail.
3. Click Pay Now.
4. Complete payment in Sandbox flow/simulator.
5. Run manual status check.
6. Verify order/payment become `PAID`.
