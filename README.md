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

Authentication links intentionally point to the routes that will be implemented in Increment 2.

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
│   └── page.tsx          # Public landing page
└── components/
    ├── brand-mark.tsx    # Reusable brand symbol and wordmark
    ├── product-preview.tsx
    ├── site-header.tsx
    └── typewriter-text.tsx
```

## Privacy direction

The landing page describes the intended privacy posture. The underlying account controls, data deletion workflow, authorization boundaries, and secure storage will be implemented and tested in later increments before the application is represented as production-ready.

## License

Copyright © 2026 Happiness Journal. All rights reserved.
