# Lumina foundation

## Folder structure

- `supabase/migrations` — PostgreSQL schema, seeds, storage buckets.
- `src/lib/supabase` — server-only Supabase service client.
- `src/lib/auth` — custom password hashing, signed cookie sessions, RBAC, auth actions.
- `src/app/(public)` — storefront routes.
- `src/app/(customer)` — protected customer account/cart/checkout routes.
- `src/app/admin` — protected admin routes.
- `src/app/api` — webhooks and backend-only integrations.

## Auth/RBAC rules

- Passwords use Node `crypto.scryptSync`; no Supabase Auth.
- Session cookie is HMAC-signed, `httpOnly`, `sameSite=lax`, `secure` in production.
- `SUPER_ADMIN` gets `*` by code.
- `ADMIN` gets module permissions except `discounts.manage` by default.
- All admin pages/server handlers must call `requirePermission(code)`.
- Customer protected pages call `requireUser()`.

## Next modules

1. Admin route shell + middleware guard.
2. Product/category/variant server actions.
3. Storage upload service with bucket + MIME + size checks.
