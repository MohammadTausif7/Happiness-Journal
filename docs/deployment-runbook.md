# Happiness Journal deployment runbook

Follow this order for the final deployment.

## 1. Push the final code to GitHub

Work should land on `test`, then merge to `main`.

```bash
git checkout test
git push origin test
git checkout main
git merge test
git push origin main
git checkout test
```

## 2. Create the Vercel project

1. Open `https://vercel.com`.
2. Import the GitHub repository.
3. Select the Next.js framework preset.
4. Set the production branch to `main`.
5. Do not deploy yet if Vercel asks for environment variables first.

Add these initial values:

```env
NEXT_PUBLIC_DATA_MODE=server
APP_ENV=production
DATABASE_SSL=true
PAYMENT_PROVIDER=stripe
```

After the first Vercel project exists, copy the Vercel production URL. Use it for:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
STRIPE_SUCCESS_URL=https://your-vercel-url.vercel.app/journal?contribution=success
STRIPE_CANCEL_URL=https://your-vercel-url.vercel.app/contribute?contribution=cancelled
```

## 3. Create the Postgres database

Use Supabase or Neon.

Needed Vercel variable:

```env
DATABASE_URL=your_postgres_connection_string
```

Use the pooled connection string if your provider gives one. Keep `DATABASE_SSL=true`.

## 4. Generate app secrets

Run locally:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

Add the two generated values to Vercel:

```env
AUTH_SECRET=first_generated_value
ENCRYPTION_KEY=second_generated_value
```

Do not commit these values.

## 5. Configure Resend

1. Open `https://resend.com`.
2. Create an API key.
3. Add or verify your sender/domain.
4. Add these Vercel variables:

```env
EMAIL_FROM=Happiness Journal <your_verified_sender>
EMAIL_PROVIDER_API_KEY=your_resend_api_key
```

If you are still in Resend testing mode, only verified recipient addresses may receive email.

## 6. Configure Stripe

1. Open `https://dashboard.stripe.com`.
2. Add your payout bank details inside Stripe only.
3. Copy your secret key.
4. Add it to Vercel:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
```

After the Vercel deployment URL exists, create a Stripe webhook endpoint:

```text
https://your-vercel-url.vercel.app/api/contributions/webhook
```

Listen for:

```text
checkout.session.completed
```

Copy the webhook signing secret and add it to Vercel:

```env
STRIPE_WEBHOOK_SECRET=your_webhook_signing_secret
```

## 7. Deploy from Vercel

Trigger a production deployment from `main`.

After deployment, open:

```text
https://your-vercel-url.vercel.app/api/health
```

Expected production response:

```json
{
  "status": "ok",
  "readiness": {
    "core": "configured",
    "payments": "configured",
    "webhooks": "configured"
  }
}
```

## 8. Smoke test as an end user

1. Open the landing page.
2. Create a new account.
3. Confirm the verification email arrives.
4. Sign out.
5. Sign in again and confirm the two-factor email arrives.
6. Create a journal entry.
7. Refresh the page and confirm the entry is still there.
8. Open Relive Moments and confirm the entry appears in the timeline.
9. Open Account Center and change a theme/preference.
10. Download an encrypted export.
11. Open Contribute and test Stripe Checkout.

Use Stripe test mode until you are comfortable with the flow.
