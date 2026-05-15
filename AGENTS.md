# AGENTS.md - Quiniela

Retro pixel art football prediction app. Astro 6 + React 19 + Firebase.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Vitest watch mode
pnpm test:run     # Run tests once
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint + fix
pnpm format       # Prettier
```

**Verification order:** `lint → test:run → build`

## Architecture

- **i18n:** Spanish (`es`) at `/`, English at `/en/`. No redirect file needed.
- **Routing:** One page file per locale (e.g., `src/pages/index.astro` for Spanish, `src/pages/en/index.astro` for English). Do NOT use `[locale]` dynamic routes.
- **Components:** Atomic Design — `@atoms/`, `@molecules/`, `@organisms/`, `@templates/`
- **State:** Zustand (not yet installed, planned)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions) — not yet configured

## Path Aliases

`@/`, `@atoms/`, `@molecules/`, `@organisms/`, `@templates/`, `@layouts/`, `@styles/`, `@utils/`, `@hooks/`, `@store/`, `@services/`, `@types/`, `@locales/`

Configured in both `astro.config.ts` (Vite) and `tsconfig.json`.

## Design System

Retro pixel art aesthetic in `src/styles/global.css`:
- Sharp corners (no `border-radius`)
- Blocky shadows (`4px 4px 0px`, no blur)
- 4px solid borders
- CSS variables for all tokens (colors, spacing, typography, animations)
- Press Start 2P font for headings, Inter for body

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

## Project Plan

See `.plan/PROJECT_PLAN.md` for user stories, schema, and progress tracker.
