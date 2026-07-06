# GitHub readiness

Before first push:

1. Confirm `.env` is ignored.
2. Confirm `.env.example` has safe empty values.
3. Run secret search.
4. Remove temporary runtime files.
5. Run checks:

```bash
npm run lint
npm run build
git status
```

Do not commit:

- Supabase service role keys
- Midtrans server keys
- Gmail/SMTP credentials
- Session secrets
- Local `.env` files
