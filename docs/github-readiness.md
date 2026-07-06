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

## CI/CD

GitHub Actions runs `npm ci`, `npm run lint`, and `npm run build` on pushes and pull requests to `main` using Node.js 22.

The workflow uses dummy build-time environment values only. Real Supabase, Midtrans, SMTP, and session secrets must be configured in Vercel Environment Variables, not GitHub and not the repo.

Vercel should deploy from `main` after CI/build is clean.
