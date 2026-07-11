# Free-first deployment setup guide

This guide lists the accounts and values needed for the final production increment. Prefer free tiers while building the portfolio version.

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

Steps:

1. Go to `https://vercel.com`.
2. Sign up with GitHub.
3. Choose “Add New Project”.
4. Import the `Happiness-Journal` GitHub repository.
5. Keep the framework as Next.js.
6. Add environment variables from `.env.example` when Increment 7 is ready.
7. Deploy from `main`.

Cost: Vercel Hobby is free for portfolio projects. A custom domain is optional and usually costs money.

Needed value:

- `NEXT_PUBLIC_APP_URL` — the deployed Vercel URL or your custom domain.

## 3. Database

Recommended free option: Supabase Postgres or Neon Postgres.

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

Recommended free-first option: Resend.

Steps:

1. Create a new email address for the project, for example `happinessjournal.app@gmail.com`.
2. Go to `https://resend.com`.
3. Sign up.
4. Create an API key.
5. For production-quality sending, verify a domain in Resend.

Important:

- A Gmail address is fine for admin/support contact.
- For app verification emails, a provider like Resend is better than sending directly from Gmail.
- Without a custom domain, email providers may restrict who you can send to during testing.

Cost: Resend has a free tier. A custom domain is optional but usually costs money.

Needed values:

- `EMAIL_FROM`
- `EMAIL_PROVIDER_API_KEY`

## 6. Payments / contributions

Recommended: Stripe Checkout for one-time contributions.

Steps:

1. Go to `https://stripe.com`.
2. Create a Stripe account.
3. Complete identity/business profile setup.
4. Add your bank payout details inside Stripe only.
5. Create a one-time donation product or price.
6. Copy the Price ID.
7. Create a webhook endpoint after the app is deployed.

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
- `STRIPE_DONATION_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`

## 7. Optional custom domain

Examples:

- `happinessjournal.app`
- `myhappinessjournal.com`

Cost: usually paid yearly.

This is optional for a software-job portfolio. A Vercel URL is enough to demonstrate the project.
