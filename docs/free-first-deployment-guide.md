# Free-first deployment setup guide

This guide lists the accounts and values used for the live Happiness Journal deployment. Prefer free tiers while building or maintaining the portfolio version.

Live deployment: [https://happiness-journal-web.vercel.app/](https://happiness-journal-web.vercel.app/)

Current provider choices:

- Vercel for hosting
- Supabase Postgres for the database
- Gmail SMTP for transactional email
- Stripe for one-time contributions

## 1. GitHub repository

Status: already in use.

You need:

- A GitHub account
- The `Happiness-Journal` repository
- A `main` branch for production-ready code
- A `test` branch for increment work

Cost: free.

## 2. Hosting

Recommended: Vercel.

Current status: deployed on Vercel from the GitHub `main` branch.

Steps:

1. Go to `https://vercel.com`.
2. Sign up with GitHub.
3. Choose “Add New Project”.
4. Import the `Happiness-Journal` GitHub repository.
5. Keep the framework as Next.js.
6. Add environment variables from `.env.example` before the production deploy.
7. Deploy from `main`.

Cost: Vercel Hobby is free for portfolio projects. A custom domain is optional and usually costs money.

Needed value:

- `NEXT_PUBLIC_APP_URL=https://happiness-journal-web.vercel.app`
- `NEXT_PUBLIC_DATA_MODE=server`
- `APP_ENV=production`

## 3. Database

Recommended free option: Supabase Postgres or Neon Postgres.

Current status: Supabase Postgres is used for production.

Supabase steps:

1. Go to `https://supabase.com`.
2. Sign up with GitHub.
3. Create a new project.
4. Save the generated database password somewhere private.
5. Open Project Settings → Database.
6. Copy the connection string.

Neon steps:

1. Go to `https://neon.tech`.
2. Sign up with GitHub.
3. Create a new Postgres project.
4. Copy the pooled connection string.

Cost: both have free tiers suitable for this project.

Needed value:

- `DATABASE_URL`
- `DATABASE_SSL=true`

## 4. App secrets

These should be generated, not reused from personal passwords.

Generate locally:

```bash
openssl rand -base64 32
```

Run it twice and use one value for each key.

Needed values:

- `AUTH_SECRET`
- `ENCRYPTION_KEY`

Cost: free.

## 5. Transactional email

Recommended free-first option: a dedicated Gmail account with an app password.

Current status: Gmail SMTP is used for verification-code emails through Nodemailer.

Steps:

1. Create a new email address for the project, for example `happinessjournal.app@gmail.com`.
2. Open that Google Account’s security settings.
3. Enable 2-Step Verification.
4. Open App passwords.
5. Create an app password for Mail and copy it.
6. Add the SMTP values in Vercel.

Important:

- Use a dedicated project Gmail account, not your personal Gmail account.
- Use the generated app password, not the normal mailbox password.
- Gmail SMTP is free-first and works without buying a domain, but it has daily sending limits and is not ideal for high-volume production.

Cost: free.

Needed values:

- `EMAIL_FROM`
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER`
- `SMTP_PASS`

## 6. Payments / contributions

Recommended: Stripe Checkout for one-time contributions.

Current status: Stripe Checkout is used for one-time contributions, with webhook confirmation at `/api/contributions/webhook`.

Steps:

1. Go to `https://stripe.com`.
2. Create a Stripe account.
3. Complete identity/business profile setup.
4. Add your bank payout details inside Stripe only.
5. Copy your secret key from Developers → API keys.
6. Create a webhook endpoint after the app is deployed.

Important:

- Do not put bank routing or account numbers in this codebase.
- Do not send bank details to Codex or GitHub.
- The website should only use Stripe API keys and checkout sessions.
- Stripe handles the card payment and later pays out to your bank.

Cost:

- Stripe account creation has no monthly fee.
- Stripe charges transaction fees only when someone contributes.

Needed values:

- `PAYMENT_PROVIDER=stripe`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`

## 7. Optional custom domain

Examples:

- `happinessjournal.app`
- `myhappinessjournal.com`

Cost: usually paid yearly.

This is optional for a software-job portfolio. A Vercel URL is enough to demonstrate the project.
