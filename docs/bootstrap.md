# SUPER_ADMIN bootstrap

Safe dev-only script:

```bash
BOOTSTRAP_ADMIN_EMAIL=owner@example.com \
BOOTSTRAP_ADMIN_NAME="Owner" \
BOOTSTRAP_ADMIN_PASSWORD="change-me-strong" \
npm run bootstrap:super-admin
```

Or CLI args:

```bash
npm run bootstrap:super-admin -- owner@example.com "Owner" "change-me-strong"
```

Requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Safety:

- Refuses to run when `NODE_ENV=production`.
- Hashes password with existing `hashPassword()`.
- Upserts `SUPER_ADMIN` role assignment.
