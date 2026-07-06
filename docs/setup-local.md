# Local setup

## Requirements

- Node.js 22+
- npm
- Supabase project
- Midtrans Sandbox account for payment testing

## Steps

```bash
npm install
cp .env.example .env
```

Fill `.env` with local development values. Never commit `.env`.

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_NOTIFICATION_URL=
APP_URL=http://127.0.0.1:3000
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

Run migrations in Supabase SQL editor or CLI, then seed/bootstrap users as needed.

```bash
npm run bootstrap:super-admin
npm run dev
```

Use one origin only for runtime tests:

```text
http://127.0.0.1:3000
```

Do not mix `localhost` and `127.0.0.1` because auth cookies are origin-scoped.
