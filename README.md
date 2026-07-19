# Happiness Journal

Happiness Journal is a deployed, privacy-minded daily journal that turns moods and memories into a visual calendar. Users can create an account, verify sign-in by email, write encrypted journal moments, revisit older entries through a timeline, and make optional one-time contributions.

Live website: [https://happiness-journal-web.vercel.app/](https://happiness-journal-web.vercel.app/)

## Production stack

- Framework: Next.js, React, TypeScript
- Hosting: Vercel
- Database: Supabase Postgres
- Email verification: Resend
- Contributions: Stripe Checkout and Stripe webhooks
- Security: httpOnly sessions, server-side validation, scrypt password hashing, AES-GCM journal encryption, account-scoped APIs

## Project history

The project was built in seven deliberate increments, with each increment leaving the application in a reviewable state.

## Increment 1: product foundation

The first increment establishes the visual language and public landing experience:

- Responsive landing page with a floating glass navigation bar
- Original Happiness Journal wordmark and application icon
- Typewriter welcome message with reduced-motion support
- Animated calendar product preview and mood effects
- Mood, feature, privacy, process, and call-to-action sections
- Responsive mobile navigation and accessible focus styles
- SEO metadata, social metadata, and environment-aware canonical base URL
- TypeScript, ESLint, and production build tooling

## Increment 2: account access workflow

The second increment turns those public links into a testable account flow:

- Sign-up page with name, email, password, privacy acknowledgement, and email reminder preference
- Demo email verification step with a generated six-digit code
- Sign-in page with password validation and a second two-factor verification step
- Browser-local account storage so the full flow can be tested without a backend yet
- Password hashing with the Web Crypto API before saving the demo account record
- Signed-in journal dashboard shell with mood calendar preview, view controls, account session card, and sign out
- Route-level metadata for sign-up, sign-in, and journal dashboard pages
- Documentation for the temporary demo-auth boundary before production email/database work

Increment 2 intentionally uses `localStorage` instead of a production database or email provider. This keeps the portfolio workflow reviewable now while leaving a clean seam for the real backend, account deletion, and privacy controls in later increments.

## Increment 3: journal dashboard and calendar views

The third increment turns the signed-in space into an interactive journal dashboard:

- Browser-local journal entry storage scoped to the signed-in demo account
- Seeded starter entries so a new account immediately shows realistic calendar activity
- Month, week, and today calendar modes with selectable days
- Mood-aware calendar cells with emoji markers, entry counts, and visual atmosphere classes
- Selected-day panel that retrieves and displays entries for the active date
- Quick capture form for saving lightweight moments directly to the calendar
- Recent entries list that jumps the calendar to the selected moment
- Dashboard stats for monthly entries, current streak, favorite mood, and last refresh time
- Manual refresh action to simulate retrieving the latest journal data

Increment 3 keeps persistence local while shaping the same data boundaries that will later connect to a database-backed API.

## Increment 4: journal editor and mood experiences

The fourth increment makes writing feel like the core product experience:

- Focused journal editor modal for creating new entries and editing existing moments
- Date, title, animated mood palette, long-form notes, and writing prompt helpers
- Mood-specific editor atmospheres including sunshine, hearts, rain, calm gradients, sparks, and ember effects
- Selected-day mood atmosphere so the dashboard reflects the emotional tone of saved entries
- “+ New” dashboard action that opens the editor for the active day
- Edit controls on saved entries that reopen the editor with existing content
- Journal update helper for modifying local entries while preserving account scoping and sync metadata
- Writing studio card that replaces the earlier quick-capture form with a fuller journaling workflow
- Enhanced mood scenes with sun bloom, flying hearts, calm sky, star/cracker pops, surprised emojis, realistic layered rain, timed thunder/lightning, and frustrated ember motion
- Previous, today, and next calendar controls for browsing earlier or future journal dates
- Dedicated Relive Moments page with timeline-arranged journal events and floating mood readers for full journal notes

Increment 4 still uses local browser persistence, but the editor flow now mirrors the end-state product interaction more closely.

## Increment 5: account management and privacy controls

The fifth increment adds the user-owned settings layer:

- Dedicated account center for profile, privacy, preferences, export, and deletion controls
- Profile update workflow with email validation and duplicate-email protection
- Privacy toggles for email verification codes, private mood summaries, encrypted exports, and reminder emails
- Theme preferences with live local theme application
- Calendar default view preference that is respected by the journal dashboard
- Account-scoped encrypted export using Web Crypto AES-GCM with PBKDF2-SHA-256 key derivation
- Local account deletion workflow requiring password confirmation and a typed DELETE acknowledgement
- Data audit summary showing account creation date, entry count, and latest journal date
- Production-readiness checklist for authentication, encryption, database deletion, exports, and secret management

Increment 5 continues to use browser-local demo storage, but it introduces the account and privacy workflows that will map to server-backed production infrastructure later.

## Increment 6: landing experience and contribution readiness

The sixth increment improves the first impression and prepares key production seams:

- Clearer public hero copy so new visitors immediately understand the app as a private mood journal
- Animated mood orbit, product metrics, richer calendar preview, and live memory cards on the landing page
- “At a glance” product flow explaining write, feel, and relive in one scan
- Production-readiness section that names the auth, email, database, export, and payment boundaries
- Dedicated `/contribute` page for one-time contribution checkout preview
- Client-side contribution validation for amount, email, and note length
- `/api/contributions/checkout` route that validates payment requests and safely refuses live checkout until provider credentials exist
- `/api/health` route for checking missing production environment configuration
- Expanded `.env.example` and production-readiness documentation for final deployment planning

Increment 6 still does not process real payments. The contribution endpoint is intentionally guarded until Stripe or another payment provider is configured in production.

## Increment 7: production backend and deployment readiness

The seventh increment adds the server-backed production path:

- `NEXT_PUBLIC_DATA_MODE=server` switch for deployed server-backed behavior while keeping local browser mode available
- Postgres schema initialization for accounts, sessions, verification codes, journal entries, and contributions
- Server-side sign-up, sign-in, sign-out, and httpOnly cookie session workflows
- Scrypt password hashing with per-account salts
- Transactional email verification-code handoff through Resend
- Account-scoped journal APIs for reading, creating, updating, and deleting entries
- AES-GCM encryption for stored journal titles and notes using `ENCRYPTION_KEY`
- Account profile, preferences, encrypted export, and deletion APIs
- Stripe Checkout creation for one-time contributions
- Stripe webhook signature verification for completed contribution tracking
- Deployment health check that reports configuration readiness without exposing secret values in production
- Free-first deployment guide for Vercel, Supabase/Neon, Resend, and Stripe

## Local development

Requirements:

- Node.js 20.9 or newer
- npm 10 or newer

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local mode is the default:

```env
NEXT_PUBLIC_DATA_MODE=local
```

Production deployment should use:

```env
NEXT_PUBLIC_DATA_MODE=server
APP_ENV=production
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployed configuration

The live deployment uses:

```env
NEXT_PUBLIC_APP_URL=https://happiness-journal-web.vercel.app
NEXT_PUBLIC_DATA_MODE=server
APP_ENV=production
DATABASE_SSL=true
PAYMENT_PROVIDER=stripe
```

Secrets such as `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`, `EMAIL_PROVIDER_API_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` are stored only in Vercel environment variables and are not committed to the repository.

## Project roadmap

1. Product foundation and landing page
2. Authentication and email verification
3. Journal dashboard and calendar views
4. Journal editor and animated mood experiences
5. Account, privacy, themes, and email preferences
6. Landing experience polish and secure contribution readiness
7. Production backend, provider integrations, testing, tutorial media, and deployment

## Current structure

```text
src/
├── app/
│   ├── globals.css       # Design tokens, responsive layout, and animations
│   ├── icon.svg          # Application icon
│   ├── account/page.tsx  # Account, privacy, and data settings route
│   ├── layout.tsx        # Root metadata and document structure
│   ├── contribute/page.tsx # Contribution checkout preview
│   ├── journal/page.tsx  # Signed-in dashboard shell
│   ├── page.tsx          # Public landing page
│   ├── relive/page.tsx   # Timeline page for reading past moments
│   ├── sign-in/page.tsx  # Sign-in route
│   └── sign-up/page.tsx  # Sign-up route
├── lib/
│   ├── demo-auth.ts      # Browser-local fallback auth helpers for development
│   ├── demo-journal.ts   # Browser-local fallback journal data helpers
│   ├── demo-privacy.ts   # Browser-local encrypted export helpers
│   ├── client/           # Server-mode client API helpers
│   └── server/           # Database, auth, email, encryption, and Stripe helpers
└── components/
    ├── account/          # Account management and privacy controls
    ├── auth/             # Sign-up, sign-in, and auth page layout
    ├── brand-mark.tsx    # Reusable brand symbol and wordmark
    ├── contributions/    # Contribution checkout preview form
    ├── journal/          # Dashboard and journal editor components
    ├── product-preview.tsx
    ├── site-header.tsx
    └── typewriter-text.tsx
```

## Privacy direction

Happiness Journal supports two data modes:

- `NEXT_PUBLIC_DATA_MODE=local` keeps the original browser-local flow available for development and portfolio walkthroughs without external services.
- `NEXT_PUBLIC_DATA_MODE=server` enables the deployable production path with Postgres-backed accounts, httpOnly sessions, email verification codes, encrypted journal content, account-scoped retrieval, encrypted exports, account deletion, Stripe Checkout, and webhook validation.

Production deployments should use server mode with deployment-managed secrets, a working Postgres database, a verified Resend sender, Stripe keys/webhook setup, and `APP_ENV=production`. The final deployment checklist is documented in [docs/deployment-runbook.md](docs/deployment-runbook.md).

## License

Copyright © 2026 Happiness Journal. All rights reserved.
