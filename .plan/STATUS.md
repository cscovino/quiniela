# Quiniela — Remediation Status Checklist

> Companion to `.plan/REMEDIATION_PLAN.md`. Single source of truth for what's done.
> Last updated: 2026-05-23.

Legend: `[x]` done · `[~]` partial · `[ ]` pending · `[-]` dropped/superseded

---

## Phase 0 — Hosting hygiene

- [x] **0.1** Remove SPA catch-all rewrite — `firebase.json:33-46`
- [x] **0.2** `_astro/**` immutable cache header — `firebase.json:49-55`
- [x] **0.3** `**/*.html` no-cache header — `firebase.json:58-64`
- [x] **0.4** Security headers (X-Content-Type-Options, Referrer-Policy, Permissions-Policy) — `firebase.json:69-80`
- [x] **0.5** CSP moved from `<meta>` to headers — `firebase.json:81-84`; `<meta>` removed from `BaseLayout.astro`
- [x] **0.6** `cleanUrls: true`, `trailingSlash: false` — `firebase.json:31-32`
- [~] **0.7** Delete dead Astro API routes — files deleted; **empty `src/pages/api/` directory still present** (Sprint 1 S1.4)
- [x] **0.8** `.gitignore` `.firebase/`, `*.log` — `.gitignore:29, 38`
- [x] **0.9** Delete commented Firebase block — `BaseLayout.astro` clean (152 lines)
- [x] **0.10** Fix `initAuth` listener leak — `auth-store.ts:26-43, 123-129`

**Phase 0: COMPLETE** (1 cosmetic carryover to S1.4)

---

## Sprint 1 — Production blockers (NEW, urgent)

- [x] **S1.1** Wrap `nav-auth.ts` setup in function; bind to `astro:page-load`; handle re-subscribe cleanup
- [x] **S1.2** Verify CSP `style-src 'self'` doesn't break Astro scoped styles; added `'unsafe-inline'` to `style-src`
- [x] **S1.3** Remove unconditional `display: none` on `[data-auth-desktop]` / `[data-auth-login]` — `NavBar.astro:404-410`
- [x] **S1.4a** `rmdir src/pages/api/` (already gone)
- [x] **S1.4b** Type `render(user)` in `nav-auth.ts` (User | null)
- [x] **S1.4c** Remove orphan `window.dispatchEvent('authStateChanged')` — `LoginForm.tsx`
- [x] **S1.4d** Remove orphan `window.dispatchEvent('authStateChanged')` — `RegisterForm.tsx`

**Sprint 1: 7 of 7 done** ✅

---

## Phase 1 — Cloud Function endpoints + NavBar auth

- [x] **1.1a** `/api/standings` Cloud Function — `functions/src/api/standings.ts`
- [x] **1.1b** `/api/rankings` Cloud Function — `functions/src/api/rankings.ts`
- [x] **1.1c** `/api/live` Cloud Function — `functions/src/api/live.ts`
- [x] **1.1d** Functions exported from `functions/src/index.ts`
- [x] **1.1e** `firebase.json` rewrites map `/api/*` to functions
- [-] **1.2** NavBar auth visibility (original CSS-specificity diagnosis) — **superseded by Sprint 1 S1.1+S1.3** (real cause is `astro:page-load` not bound)
- [x] **1.3a** Single `auth-bootstrap.ts` module — `src/services/auth-bootstrap.ts`
- [x] **1.3b** Remove `initAuth()` from `HomeTemplate` — verified gone
- [x] **1.3c** Remove `initAuth()` from `PredictionsTemplate` — verified gone
- [x] **1.3d** Remove `initAuth()` from `ProfileTemplate` — verified gone
- [x] **1.3e** Remove `initAuth()` from `AuthGuard` — component itself deleted

**Phase 1: COMPLETE** (1.2 absorbed into Sprint 1)

---

## Phase 2 — Astro takes over public pages

- [ ] **2.1a** Wire `getCollection('teams')` in Home/Tournament/Rankings frontmatter
- [ ] **2.1b** Wire `getCollection('groups')` in same
- [ ] **2.2** Create `src/lib/build-data.ts` (firebase-admin build-time fetch)
- [ ] **2.3a** Convert `src/pages/index.astro` + `src/pages/en/index.astro` to static shell + `client:idle` data fetch
- [ ] **2.3b** Convert `src/pages/torneo.astro` + `src/pages/en/tournament.astro` to same
- [ ] **2.3c** Convert `src/pages/clasificacion.astro` + `src/pages/en/rankings.astro` to same
- [ ] **2.4a** Downgrade `ProfilePage.astro` `client:load` → `client:idle`
- [ ] **2.4b** Downgrade admin matches `client:load` → `client:idle`
- [ ] **2.5a** Consolidate i18n into `src/utils/i18n.ts` (single source)
- [ ] **2.5b** Remove inline `locale === 'en' ? ...` ternaries across templates
- [ ] **2.5c** Stop passing full translation dicts via `astro-island props=`
- [ ] **2.6a** Create `src/pages/[lang]/...` dynamic routes with `getStaticPaths`
- [ ] **2.6b** Delete duplicated `src/pages/en/*.astro` siblings
- [ ] **2.6c** Delete `src/middleware.ts`

**Phase 2: 0 of 14 done**

---

## Phase 3 — Lazy Firebase + correctness

- [ ] **3.1a** Refactor `firebase.ts` to export `getAuth()` / `getDb()` lazy getters
- [ ] **3.1b** Audit downstream consumers; verify bundle size drop in `dist/_astro/`
- [x] **3.2a** Read role from `idTokenResult.claims.role` — `auth-helpers.ts:118-124`
- [x] **3.2b** `setUserRole` Cloud Function exists — `functions/src/api/setUserRole.ts`
- [ ] **3.2c** `scripts/set-admin-role.ts` calls `setUserRole` function (not direct Firestore write)
- [ ] **3.2d** Update Firestore rules: `request.auth.token.role == 'admin'` — `firestore/firestore.rules`
- [ ] **3.2e** Smoke test admin flow end-to-end
- [ ] **3.3a** `useAuthStore` per-field selectors in `PredictionsTemplate.tsx:166`
- [ ] **3.3b** Same in `ProfileTemplate.tsx:46`
- [ ] **3.4a** `role="alert" aria-live="polite"` on `LoginForm` error region — `:147-150`
- [ ] **3.4b** Same on `RegisterForm` error region — `:109-118`
- [ ] **3.4c** Surface client-side validation errors in `RegisterForm.tsx:51-57` (don't silent-return)

**Phase 3: 2 of 12 done**

---

## Phase 4 — Cleanup

- [x] **4.2** SW shrunk to PWA shell — `public/sw.js` = 85 lines
- [x] **4.3a** Delete `PWAInstall.tsx` — already gone
- [x] **4.3b** Delete `BracketView.tsx` — already gone
- [x] **4.3c** Delete `StandingsTemplate/` — already gone
- [x] **4.3d** Delete `AuthGuard/` — already gone
- [ ] **4.3e** Delete `MatchCard.{astro,tsx,css}` (after Phase 2.3)
- [ ] **4.3f** Delete `MatchList.{astro,tsx,css}` (after Phase 2.3)
- [ ] **4.3g** Delete `GroupStandings.{astro,tsx,css}` (after Phase 2.3)
- [ ] **4.3h** Delete `TournamentHeader.{astro,tsx,css}` (after Phase 2.3)
- [ ] **4.3i** Delete `RankingsTable.{astro,tsx,css}` (after Phase 2.3)
- [ ] **4.3j** Delete `HomeTemplate/`, `TournamentTemplate/`, `RankingsTemplate/` (after Phase 2.3)
- [ ] **4.4a** Update `.plan/ASTRO_MIGRATION_PLAN.md` Phase 6 status
- [ ] **4.4b** Update `.plan/PHASE5_SSR_DEFERRED.md` to point at REMEDIATION_PLAN.md

**Phase 4: 5 of 13 done**

---

## Phase 5 — CI / cron / hardening (post-launch)

### CI + cron (moved here from Phase 4)

- [ ] **5.1a** Cloud Scheduler job (daily rebuild during tournament)
- [ ] **5.1b** GitHub Actions workflow `deploy.yml` (`astro build && firebase deploy`)
- [ ] **5.2a** GitHub Actions `ci.yml` — typecheck + lint + vitest on PR
- [ ] **5.2b** GitHub Actions `preview.yml` — Firebase Hosting preview channel per PR

### Hardening

- [ ] **5.3a** Per-page CSP nonces (replaces S1.2's `'unsafe-inline'` if needed)
- [ ] **5.3b** Break up `PredictionsTemplate.tsx` (600 LOC god-object)
- [ ] **5.3c** Polish view transitions (`<ClientRouter />` adopted; tune fade-in/out CSS)
- [ ] **5.3d** Add Sentry / TrackJS
- [ ] **5.3e** Firebase App Check

**Phase 5: 0 of 9 done**

---

## Aggregate progress

| Phase | Done | Partial | Pending | Total |
|-------|-----:|--------:|--------:|------:|
| Phase 0 | 9 | 1 | 0 | 10 |
| Sprint 1 | 7 | 0 | 0 | 7 |
| Phase 1 | 9 | 0 | 0 (1 superseded) | 10 |
| Phase 2 | 0 | 0 | 14 | 14 |
| Phase 3 | 2 | 0 | 10 | 12 |
| Phase 4 | 5 | 0 | 8 | 13 |
| Phase 5 | 0 | 0 | 9 | 9 |
| **Total** | **32** | **1** | **41** | **75** |

**~43% of scoped work complete.** Remaining: ~2 weeks of focused execution (Phase 2 = 1 week, Phase 3 = 3 days, Phase 4 = 1 day, Phase 5 = optional, post-launch).

---

## Next action

**Phase 2** is the next priority: public pages stop loading Firebase + React entirely.
Convert Home, Tournament, Rankings to static Astro shells + `client:idle` data fetch from `/api/*` Cloud Functions.
