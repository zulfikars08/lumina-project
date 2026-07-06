# Supabase

Lumina uses Supabase PostgreSQL and Supabase Storage.

## Migrations

Run migrations in order from:

```text
supabase/migrations/
```

Current foundation migration includes:

- users and custom auth tables
- roles, permissions, RBAC joins
- catalog tables
- product images
- carts and wishlists
- vouchers
- orders and order items
- payments and Midtrans notifications
- invoices
- inventory logs
- CMS/admin support tables

## Storage

Storage buckets are created by migration:

- `products`
- `banners`
- `blog`
- `content`

Product image URLs are public bucket paths.

## Service role key

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to browser code and never commit it.
