# AGENTS.md - Quiniela

Retro pixel art football prediction app. Astro 6 + React 19 + Firebase.

**Lighthouse:** Accessibility 100 | SEO 100 | Best Practices 96

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm test         # Vitest watch mode
pnpm test:run     # Run tests once
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint + fix
pnpm format       # Prettier
pnpm storybook    # Start Storybook dev server (port 6006)
pnpm build-storybook  # Build Storybook static
pnpm seed         # Seed Firestore with tournament data
pnpm set-admin    # Promote user to admin
node scripts/generate-content.mjs  # Generate content collection files
```

**Verification order:** `lint → test:run → build`

## Architecture

- **i18n:** Spanish at `/es/`, English at `/en/`. Dynamic `[lang]/[slug]` routes with localized slugs (e.g., `/es/torneo`, `/en/tournament`). Slug map in `src/utils/slug-map.ts`.
- **Routing:** One page file per route under `src/pages/[lang]/`. English slugs used for both locales (e.g., `/es/tournament`, `/en/tournament`). Do NOT use separate locale directories.
- **Components:** Atomic Design — `@atoms/`, `@molecules/`, `@organisms/`, `@templates/`
- **Astro Components:** MatchCard, MatchList, TournamentHeader, GroupStandings, RankingsTable, NavBar (zero-JS)
- **Public Pages:** Pure static Astro shells + `client:idle` fetch scripts (Home, Tournament, Rankings)
- **State:** Zustand (auth store, toast store)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, Cloud Messaging)
- **PWA:** Service worker, web manifest, FCM push notifications
- **Content Collections:** Teams (48), Groups (12) with Zod validation
- **Build Data:** `src/lib/build-data.ts` for build-time tournament data via Admin SDK
- **API Routes:** `/api/live`, `/api/standings`, `/api/rankings` with 5-min caching (Cloud Functions)

## Path Aliases

`@/`, `@atoms/`, `@molecules/`, `@organisms/`, `@templates/`, `@layouts/`, `@styles/`, `@utils/`, `@hooks/`, `@store/`, `@services/`, `@types/`, `@locales/`

Configured in both `astro.config.ts` (Vite) and `tsconfig.json`.

## Astro Patterns

**Zero-JS by Default:**
- Use `.astro` components for static content
- Add `client:load` only for interactive React islands
- Use `client:visible` for below-fold components
- Use `client:idle` for non-critical interactive components

**Content Collections:**
- Config: `src/content.config.ts`
- Data: `src/content/teams/*.json`, `src/content/groups/*.json`
- Import: `import { getCollection } from 'astro:content'`

**i18n Utilities:**
- `getTranslations(locale)` from `@utils/i18n`
- `getNavLinks(locale, activeNav)` from `@utils/i18n`

**View Transitions:**
- `<ClientRouter />` from `astro:transitions` in `BaseLayout.astro` `<head>`
- `transition:name="navbar"` on `NavBar.astro` root `<nav>`
- `transition:name="content" transition:animate="fade"` on `<main>` in `BaseLayout.astro`
- CSS animations in `global.css` (`::view-transition-old/new(content)`)

## Design System

Retro pixel art aesthetic in `src/styles/global.css`:
- Sharp corners (no `border-radius`)
- Blocky shadows (`4px 4px 0px`, no blur)
- 4px solid borders
- CSS variables for all tokens (colors, spacing, typography, animations)
- Press Start 2P font for headings, Inter for body
- Light/dark themes via `data-theme` attribute

## PWA

The app is a Progressive Web App:
- **Manifest:** `public/manifest.json` with icons, shortcuts, and metadata
- **Service Worker:** `public/sw.js` for offline caching and push notifications
- **FCM:** `public/firebase-messaging-sw.js` for background notifications
- **Icons:** Generated via `scripts/generate-icons.mjs` using sharp
- **Env:** Requires `VITE_FIREBASE_VAPID_PUBLIC_KEY` for push notifications

## Product Tour (driver.js)

The app uses [driver.js](https://driverjs.com/) (~8KB gzipped, MIT, zero deps) for guided onboarding tours.

- **Component:** `ProductTour` organism in `src/components/organisms/ProductTour/`
- **Tour definitions:** Pre-configured step arrays in `src/components/organisms/ProductTour/tours.ts`
  - `PREDICTION_WIZARD_TOUR` — walks through the prediction step wizard
  - `FIRST_PREDICTOR_TOUR` — auto-starts for users with no predictors
- **Persistence:** completed tours stored in `localStorage` under `tour_completed_{tourId}`
- **Triggers:**
  - First predictor tour: auto-starts with 1s delay when `predictors.length === 0`
  - Prediction wizard: manual via " Tour" button in wizard header
- **Styling:** Popover overrides in `ProductTour.css` — pixel-art aesthetic (Press Start 2P headings, 4px borders, drop-shadow, sharp corners, retro color palette via CSS variables)
- **CSP:** Compatible with existing policy (`style-src 'self' 'unsafe-inline'` allows inline popover styles)
- **Bundle:** ~8KB gzipped, loaded only on pages that import `ProductTour`

## Git Hooks

- **pre-commit:** `lint-staged` runs ESLint + Prettier on staged files
- **commit-msg:** `commitlint` enforces conventional commits

## Testing

- Vitest with jsdom environment
- Setup file: `src/test/setup.ts`
- Pattern: `src/**/*.test.{ts,tsx}`
- Aliases in `vitest.config.ts` only resolve `@/`, not component aliases

## Key Decisions

- Default locale is Spanish (not English)
- Config files use `.ts` extension (not `.mjs`/`.json`)
- Firestore `bets` split into 3 subcollections: `bets`, `group_bets`, `knockout_bets`
- No social features (leagues, friends) in MVP
- CSS variables instead of Tailwind
- Predictions use step-by-step wizard (matches → groups → final phase → best players)
- Auth guards on protected pages (predictions, rankings, profile, tournament)
- Home page is public with matches and rankings
- Firebase `browserLocalPersistence` for session persistence
- CSP meta tag in BaseLayout for XSS mitigation
- Zero vulnerabilities (`pnpm audit` clean)
- Static hosting ($0 additional cost) - SSR deferred
- Astro components for static UI (MatchCard, MatchList, etc.)
- API routes with caching for matches and rankings
- N+1 query optimized with `collectionGroup`
- Content Collections for typed team/group data
- View transitions enabled for smooth navigation
- DNS preconnect for Firebase endpoints
- Web Vitals monitoring built-in
- No middleware — locale derived from URL path in each page
- **All font-sizes use rem units** with CSS variables (`--text-*`), no hardcoded `px` (WCAG 2.2)
- **Pixel-art corners use `clip-path` polygon** (not `border-radius`); replace `box-shadow` with `filter: drop-shadow()`
- **TeamFlag uses CSS container queries** for responsive name/FIFA code display
- **PWA install prompt** uses `beforeinstallprompt` event with `localStorage` dismissal persistence
- **Service worker cache versioning:** bump `CACHE_NAME` in `sw.js` on each deploy
- **Mobile menu uses CSS `::before` backdrop overlay** pattern (not separate div)
- **Radio inputs in reusable components** must use unique names (`React.useId()`)
- **Prediction form grid** collapses to single column at 480px breakpoint
- **WC26 gradient tokens** (`--gradient-wc26-*`) for page headers and section accents

## Project Plan

See `.plan/PROJECT_PLAN.md` for user stories, schema, and progress tracker.
