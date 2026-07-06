# Deployment: Vercel

## Build

```bash
npm run lint
npm run build
```

## Environment variables

Set safe production/staging values in Vercel project settings. Do not commit `.env`.

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_NOTIFICATION_URL=
APP_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

For first deployment, keep Midtrans in Sandbox mode.

## Notes

- Configure `APP_URL` to deployed domain.
- Configure Midtrans notification URL after public domain is ready.
- Verify service role and server key are not exposed in client bundle.
