# Lumina

Lumina is a beauty/cosmetic e-commerce platform built as a fullstack Next.js app.

## Stack

- Next.js fullstack app router
- Supabase PostgreSQL
- Supabase Storage
- Custom auth and RBAC
- Midtrans Snap Sandbox foundation
- Vercel deployment target

## Implemented modules

- Auth and RBAC
- Super Admin/Admin dashboard shell
- Admin catalog: products, categories, variants
- Product image upload/primary/delete
- Public storefront: home, products, categories, static content
- Customer account and profile
- Customer addresses with ownership protection
- Wishlist add/remove/duplicate protection
- Cart add/update/remove/clear with stock validation
- Checkout and order creation
- Voucher application
- Invoice draft
- Midtrans Snap token, pay route, and manual status check foundation

## Current UI/UX status

- Light mode is the default theme.
- Dark mode is supported through shared theme tokens.
- Storefront header, footer, product cards, auth pages, account shell, and admin shell have been polished.
- Customer cart checkout flow was verified with an authenticated runtime customer.
- Checkout readability was verified with an authenticated runtime customer.
- Admin dashboard/products were audited with a Super Admin session.
- Detailed audit notes live in [`docs/ui-ux-audit.md`](docs/ui-ux-audit.md).

## Not finished yet

- Midtrans webhook runtime with public URL
- Receipt email sending
- Full mobile visual QA with real viewport screenshots
- Full authenticated customer/admin page-by-page visual QA
- Runtime product image asset replacement
- Production deployment hardening

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Fill `.env` with Supabase and sandbox Midtrans values.

4. Apply Supabase migrations from `supabase/migrations`.

5. Bootstrap Super Admin:

```bash
npm run bootstrap:super-admin
```

6. Start dev server:

```bash
npm run dev
```

Use `http://127.0.0.1:3000` for local auth/runtime testing.

## Checks

```bash
npm run lint
npm run build
```

See `docs/` for detailed setup, Supabase, Midtrans, deployment, and testing notes.
