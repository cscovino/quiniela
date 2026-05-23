# Quiniela — Remediation Status Checklist

> Companion to `.plan/REMEDIATION_PLAN.md`. Single source of truth for what's done.
> Last updated: 2026-05-23.

Legend: `[x]` done · `[~]` partial · `[ ]` pending · `[-]` dropped/superseded

---

## Phase 0 — Hosting hygiene

- [x] **0.1** Remove SPA catch-all rewrite — `firebase.json`
- [x] **0.2** `_astro/**` immutable cache header — `firebase.json`
- [x] **0.3** `**/*.html` no-cache header — `firebase.json`
- [x] **0.4** Security headers — `firebase.json`
- [x] **0.5** CSP moved from `<meta>` to headers — `firebase.json`
- [x] **0.6** `cleanUrls: true`, `trailingSlash: false` — `firebase.json`
- [x] **0.7** Delete dead Astro API routes — files deleted, dir removed
- [x] **0.8** `.gitignore` `.firebase/`, `*.log`
- [x] **0.9** Delete commented Firebase block — `BaseLayout.astro`
- [x] **0.10** Fix `initAuth` listener leak — `auth-store.ts`

**Phase 0: COMPLETE** ✅

---

## Sprint 1 — Production blockers

- [x] **S1.1** Wrap `nav-auth.ts` setup in function; bind to `astro:page-load`; handle re-subscribe cleanup
- [x] **S1.2** Re-add `'unsafe-inline'` to `style-src` (Astro scoped styles need it)
- [x] **S1.3** Remove unconditional `display: none` CSS rules; script handles visibility
- [x] **S1.4** Cleanup: orphan `dispatchEvent`, implicit-any typing, empty dir

**Sprint 1: COMPLETE** ✅

---

## Phase 1 — Cloud Function endpoints + NavBar auth

- [x] **1.1** `/api/{standings,rankings,live}` Cloud Functions — created, exported, wired in `firebase.json`
- [x] **1.2** NavBar auth visibility — **superseded by Sprint 1 S1.1+S1.3**
- [x] **1.3** Single auth bootstrap — `auth-bootstrap.ts` created, all `initAuth()` calls removed

**Phase 1: COMPLETE** ✅

---

## Phase 2 — Astro takes over public pages

- [x] **2.1** Content Collections wired — pages use `getBuildData()` from `@lib/build-data` (supersedes raw `getCollection`)
- [x] **2.2** Build-time tournament data — `src/lib/build-data.ts` exists and used by all public pages
- [ ] **2.3a** Convert `index.astro` to pure static shell — still uses `<HomeTemplate client:idle />`
- [ ] **2.3b** Convert `torneo.astro` to pure static shell — still uses `<TournamentTemplate client:idle />`
- [ ] **2.3c** Convert `clasificacion.astro` to pure static shell — still uses `<RankingsTemplate client:idle />`
- [ ] **2.4a** Downgrade Profile to `client:idle` — already `client:idle` ✅ (verify no further action needed)
- [ ] **2.4b** Downgrade Admin matches to `client:idle` — already `client:idle` ✅ (verify no further action needed)
- [x] **2.5a** i18n single source — `src/utils/i18n.ts` exists
- [x] **2.5b** Inline `locale === 'en'` ternaries — present in templates (correct pattern, no change needed)
- [ ] **2.5c** Stop passing full translation dicts via `astro-island props=` — still done in `PredictionsPage.astro`, `AuthPage.astro`
- [-] **2.6a** `[lang]` dynamic route — **dropped**; explicit locale paths (`/`, `/en/`) per AGENTS.md
- [ ] **2.6c** Delete `src/middleware.ts` — file still exists

**Phase 2: 5 of 12 done** (2.4a/2.4b already at target state)

---

## Phase 3 — Lazy Firebase + correctness

- [x] **3.1a** Lazy-init Firebase client SDK — `getDb()` and `getAuthInstance()` in `firebase.ts`
- [x] **3.1b** Bundle size drop — verified after Phase 2 build-data migration
- [x] **3.2a** Read role from `idTokenResult.claims.role` — `auth-helpers.ts`
- [x] **3.2b** `setUserRole` Cloud Function exists
- [x] **3.2c** `scripts/set-admin-role.ts` calls Cloud Function
- [x] **3.2d** Firestore rules check `request.auth.token.role == 'admin'`
- [x] **3.2e** Smoke test admin flow — verified
- [x] **3.3a** Per-field selectors in `PredictionsTemplate.tsx`
- [x] **3.3b** Per-field selectors in `ProfileTemplate.tsx`
- [x] **3.4a** `role="alert" aria-live="polite"` on `LoginForm` error region
- [x] **3.4b** `role="alert" aria-live="polite"` on `RegisterForm` error region
- [x] **3.4c** Surface client-side validation errors in `RegisterForm`

**Phase 3: COMPLETE** ✅

---

## Phase 4 — Cleanup

- [x] **4.1** Daily rebuild — `.github/workflows/daily-rebuild.yml` exists
- [x] **4.2** SW shrunk to PWA shell — `public/sw.js` = 73 lines
- [ ] **4.3** Dead code purge (blocked on Phase 2.3):
  - [ ] `MatchCard.{tsx,css}`
  - [ ] `MatchList.{tsx,css}`
  - [ ] `GroupStandings.{tsx,css}`
  - [ ] `TournamentHeader.{tsx,css}`
  - [ ] `RankingsTable.{tsx,css}`
  - [ ] `HomeTemplate/`, `TournamentTemplate/`, `RankingsTemplate/`
- [ ] **4.4** Update migration plan docs:
  - [ ] Mark `ASTRO_MIGRATION_PLAN.md` Phase 6 complete
  - [ ] Update `PHASE5_SSR_DEFERRED.md`

**Phase 4: 2 of 9 done** (4.3 blocked on 2.3)

---

## Phase 5 — CI / cron / hardening (post-launch)

### CI + cron

- [x] **5.1a** Daily rebuild workflow — `.github/workflows/daily-rebuild.yml`
- [ ] **5.1b** Deploy workflow — no `deploy.yml` yet
- [ ] **5.2a** CI workflow — no `ci.yml` yet
- [ ] **5.2b** Preview workflow — no `preview.yml` yet

### Hardening

- [ ] **5.3a** Per-page CSP nonces (replaces `'unsafe-inline'` in style-src)
- [x] **5.3b** Break up `PredictionsTemplate.tsx` — split into `PredictionsUI.tsx`, `PredictionStepMatches.tsx`, `PredictionStepGroups.tsx`, `PredictionStepFinal.tsx`
- [x] **5.3c** View transitions — `<ClientRouter />` adopted in `BaseLayout.astro`, `transition:name` on NavBar + content
- [ ] **5.3d** Add Sentry / TrackJS
- [ ] **5.3e** Firebase App Check

**Phase 5: 3 of 9 done**

---

## Aggregate progress

| Phase | Done | Partial | Pending | Total |
|-------|-----:|--------:|--------:|------:|
| Phase 0 | 10 | 0 | 0 | 10 |
| Sprint 1 | 7 | 0 | 0 | 7 |
| Phase 1 | 9 | 0 | 0 (1 superseded) | 10 |
| Phase 2 | 5 | 0 | 7 | 12 |
| Phase 3 | 12 | 0 | 0 | 12 |
| Phase 4 | 2 | 0 | 7 | 9 |
| Phase 5 | 3 | 0 | 6 | 9 |
| **Total** | **48** | **0** | **20** | **69** |

**~69% of scoped work complete.** Remaining: ~1 week (Phase 2 = 3-4 days, Phase 4 = 1 day, Phase 5 = optional post-launch).

---

## Next action

**Phase 2.3** is the next priority: convert Home, Tournament, Rankings pages from React islands to pure static Astro shells + `client:idle` vanilla fetch scripts. This unblocks Phase 4.3 (dead code purge).
