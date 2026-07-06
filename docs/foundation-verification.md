# Foundation verification

## Migration

Static inspection passed for `supabase/migrations/0001_lumina_foundation.sql`:

- Enums exist: `user_status`, `order_status`, `product_status`, `discount_type`, `payment_status`.
- Core auth/RBAC tables exist: `users`, `roles`, `permissions`, `role_permissions`, `user_roles`.
- Customer tables exist: `customer_profiles`, `addresses`.
- Catalog tables exist: `categories`, `products`, `product_images`, `product_variants`, `inventory_logs`.
- Commerce tables exist: `carts`, `cart_items`, `wishlists`, `orders`, `order_items`, `payments`, `midtrans_notifications`, `invoices`.
- Content/admin tables exist: `vouchers`, `voucher_usages`, `reviews`, `banners`, `homepage_sections`, `blogs`, `static_pages`, `faqs`, `settings`, `audit_logs`.
- Foreign keys, checks, unique constraints, partial indexes, and search indexes are present.
- Storage buckets are seeded: `products`, `banners`, `blog`, `content`.

## Default roles

Seeded roles:

- `SUPER_ADMIN`
- `ADMIN`
- `CUSTOMER`

## Default permissions

Seeded admin permissions:

- `dashboard.read`
- `products.manage`
- `categories.manage`
- `orders.manage`
- `customers.read`
- `reviews.manage`
- `banners.manage`
- `blog.manage`
- `pages.manage`
- `admin_users.manage`
- `roles.manage`
- `settings.manage`
- `discounts.manage`
- `audit_logs.read`

## Role permission rules

- `SUPER_ADMIN`: all seeded permissions.
- `ADMIN`: all admin permissions except `discounts.manage`.
- `CUSTOMER`: no admin permissions in RBAC table; customer-facing access is route/action ownership based.

## Local apply status

`npx supabase db lint --local` could not run because local Postgres/Docker integration is unavailable in this WSL environment.

Command result:

```text
failed to connect to postgres: effect/sql/SqlError: PgClient: Failed to connect
```

Apply verification pending against real Supabase project or local Supabase once Docker/DB is available:

```bash
npx supabase db push
# or
npx supabase db reset
```
