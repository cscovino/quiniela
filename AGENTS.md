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

- **i18n:** Spanish (`es`) at `/`, English at `/en/`. No redirect file needed.
- **Routing:** One page file per locale (e.g., `src/pages/index.astro` for Spanish, `src/pages/en/index.astro` for English). Do NOT use `[locale]` dynamic routes.
- **Components:** Atomic Design — `@atoms/`, `@molecules/`, `@organisms/`, `@templates/`
- **Astro Components:** MatchCard, MatchList, TournamentHeader, GroupStandings, RankingsTable, NavBar (zero-JS)
- **State:** Zustand (auth store, toast store)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, Cloud Messaging)
- **PWA:** Service worker, web manifest, FCM push notifications
- **Content Collections:** Teams (48), Groups (12) with Zod validation
- **API Routes:** `/api/matches`, `/api/rankings` with 5-min caching
- **Middleware:** Locale detection, ready for SSR auth guards

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
- Enabled in `astro.config.ts` with `clientPrerender`
- CSS animations in `global.css` (`::view-transition-old/new`)

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

## Project Plan

See `.plan/PROJECT_PLAN.md` for user stories, schema, and progress tracker.
