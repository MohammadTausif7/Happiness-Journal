# Happiness Journal

Happiness Journal is a privacy-minded daily journal that turns moods and memories into a visual calendar. The project is being built in seven deliberate increments, with each increment leaving the application in a reviewable state.

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

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Project roadmap

1. Product foundation and landing page
2. Authentication and email verification
3. Journal dashboard and calendar views
4. Journal editor and animated mood experiences
5. Account, privacy, themes, and email preferences
6. Secure one-time contributions with Stripe
7. Production hardening, testing, tutorial media, and deployment

## Current structure

```text
src/
├── app/
│   ├── globals.css       # Design tokens, responsive layout, and animations
│   ├── icon.svg          # Application icon
│   ├── layout.tsx        # Root metadata and document structure
│   ├── journal/page.tsx  # Signed-in dashboard shell
│   ├── page.tsx          # Public landing page
│   ├── sign-in/page.tsx  # Sign-in route
│   └── sign-up/page.tsx  # Sign-up route
├── lib/
│   └── demo-auth.ts      # Temporary browser-local auth helpers
└── components/
    ├── auth/             # Sign-up, sign-in, and auth page layout
    ├── brand-mark.tsx    # Reusable brand symbol and wordmark
    ├── journal/          # Dashboard shell components
    ├── product-preview.tsx
    ├── site-header.tsx
    └── typewriter-text.tsx
```

## Privacy direction

The landing page describes the intended privacy posture. The underlying account controls, data deletion workflow, authorization boundaries, and secure storage will be implemented and tested in later increments before the application is represented as production-ready.

The Increment 2 auth flow is a local demo implementation. It is suitable for portfolio review and user-flow testing, but production deployment still needs server-side authentication, encrypted database storage, transactional email delivery, rate limiting, and account deletion controls.

## License

Copyright © 2026 Happiness Journal. All rights reserved.
