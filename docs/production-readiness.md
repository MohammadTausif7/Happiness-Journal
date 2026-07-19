# Production readiness handoff

Happiness Journal is deployed at [https://happiness-journal-web.vercel.app/](https://happiness-journal-web.vercel.app/).

The production deployment uses Vercel, Supabase Postgres, Resend, and Stripe. In production, `NEXT_PUBLIC_DATA_MODE=server` makes accounts, sessions, journal entries, exports, and contributions use the server APIs.

For step-by-step setup instructions, see `docs/free-first-deployment-guide.md` and `docs/deployment-runbook.md`.

## What is ready now

- Public landing page explains the product at a glance.
- `/contribute` provides a one-time contribution flow preview with client-side validation.
- `/api/contributions/checkout` validates checkout input and creates a Stripe Checkout session when payment credentials are present.
- `/api/contributions/webhook` verifies Stripe webhook signatures and records successful contribution status.
- `/api/health` reports which production environment variables are still missing.
- `.env.example` lists the core app, email, database, encryption, and payment configuration expected before deployment.

## Production provider checklist

1. Deployment target
   - Current: Vercel deploying from `main`.
   - Live URL: `https://happiness-journal-web.vercel.app/`.

2. Database provider
   - Current: Supabase Postgres.
   - Required Vercel vars: `DATABASE_URL` and `DATABASE_SSL=true`.

3. Authentication/session secret
   - Required Vercel var: strong production-only `AUTH_SECRET`.

4. Encryption secret
   - Required Vercel var: strong production-only `ENCRYPTION_KEY`.

5. Transactional email provider
   - Current: Resend.
   - Required Vercel vars: `EMAIL_FROM`, `EMAIL_PROVIDER_API_KEY`, and a verified sender/domain.

6. Payment provider for contributions
   - Current: Stripe Checkout for one-time contributions.
   - Required Vercel vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUCCESS_URL`, and `STRIPE_CANCEL_URL`.

7. Domain and policy copy
   - Current: Vercel production domain.
   - Recommended next polish: custom domain, privacy policy text, support email, and contribution/refund language.

## Final increment implementation checklist

- Use server-side account creation, login, logout, and session validation.
- Use transactional email delivery for verification codes.
- Store journal entries in Postgres with account-scoped authorization checks.
- Store passwords with server-side scrypt hashing and never expose secrets to the browser.
- Use API validation for journal create/update/delete, account deletion, exports, and contribution checkout.
- Use Stripe Checkout and webhook verification for successful contributions.
- Add deployment environment variables and verify `/api/health`.
- Run lint, typecheck, production build, and a browser smoke test before pushing to `main`.
