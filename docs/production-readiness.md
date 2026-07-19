# Production readiness handoff

The final increment adds deployable server-backed foundations while keeping local browser mode available for development. In production, set `NEXT_PUBLIC_DATA_MODE=server` so accounts, sessions, journal entries, exports, and contributions use the server APIs.

For step-by-step setup instructions, see `docs/free-first-deployment-guide.md` and `docs/deployment-runbook.md`.

## What is ready now

- Public landing page explains the product at a glance.
- `/contribute` provides a one-time contribution flow preview with client-side validation.
- `/api/contributions/checkout` validates checkout input and creates a Stripe Checkout session when payment credentials are present.
- `/api/contributions/webhook` verifies Stripe webhook signatures and records successful contribution status.
- `/api/health` reports which production environment variables are still missing.
- `.env.example` lists the core app, email, database, encryption, and payment configuration expected before deployment.

## What is needed from you before Increment 7

1. Deployment target
   - Recommended: Vercel for this Next.js project.
   - Needed: permission to connect the GitHub repo and deploy from `main`.

2. Database provider
   - Recommended: Supabase Postgres or Neon Postgres.
   - Needed: `DATABASE_URL` and usually `DATABASE_SSL=true`.

3. Authentication/session secret
   - Needed: a strong `AUTH_SECRET` generated for production only.

4. Encryption secret
   - Needed: a strong `ENCRYPTION_KEY` for encrypted exports and sensitive journal storage.

5. Transactional email provider
   - Recommended: Resend, Postmark, or SendGrid.
   - Needed: `EMAIL_FROM`, `EMAIL_PROVIDER_API_KEY`, and a verified sending domain or sender address.

6. Payment provider for contributions
   - Recommended: Stripe Checkout for one-time donations.
   - Needed: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUCCESS_URL`, and `STRIPE_CANCEL_URL`.

7. Domain and policy copy
   - Optional but recommended: production domain, privacy policy text, support email, and refund/donation language.

## Final increment implementation checklist

- Use server-side account creation, login, logout, and session validation.
- Use transactional email delivery for verification codes.
- Store journal entries in Postgres with account-scoped authorization checks.
- Store passwords with server-side scrypt hashing and never expose secrets to the browser.
- Use API validation for journal create/update/delete, account deletion, exports, and contribution checkout.
- Use Stripe Checkout and webhook verification for successful contributions.
- Add deployment environment variables and verify `/api/health`.
- Run lint, typecheck, production build, and a browser smoke test before pushing to `main`.
