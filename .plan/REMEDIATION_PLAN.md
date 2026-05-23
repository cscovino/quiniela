# Quiniela — Consolidated Remediation Plan

> Source of truth for remaining work. Last re-audited: 2026-05-23.

## Current state snapshot

### Already shipped (69% complete)

| Area | Status |
|------|--------|
| Phase 0 — Hosting hygiene | ✅ COMPLETE |
| Sprint 1 — Production blockers | ✅ COMPLETE |
| Phase 1 — Cloud Function endpoints + NavBar auth | ✅ COMPLETE |
| Phase 2 — Astro takes over public pages | 5 of 12 done (build-data, i18n source ready) |
| Phase 3 — Lazy Firebase + correctness | ✅ COMPLETE |
| Phase 4 — Cleanup | 2 of 9 done (daily rebuild, SW shrink) |
| Phase 5 — CI / cron / hardening | 3 of 9 done (daily rebuild, PredictionsTemplate split, ClientRouter) |

### Remaining work

1. **Phase 2.3** — Convert Home, Tournament, Rankings pages from React islands to pure static Astro shells + `client:idle` fetch scripts. (Blocks Phase 4.3 dead code purge.)
2. **Phase 2.5c** — Stop passing full translation dicts via `astro-island props=`.
3. **Phase 2.6c** — Delete `src/middleware.ts` (locale already derived from URL).
4. **Phase 4.3** — Dead code purge (blocked on 2.3): MatchCard, MatchList, GroupStandings, TournamentHeader, RankingsTable, Home/Tournament/RankingsTemplate.
5. **Phase 4.4** — Update migration plan docs.
6. **Phase 5.1b/5.2** — CI/CD workflows (deploy, ci, preview).
7. **Phase 5.3a/5.3d/5.3e** — CSP nonces, Sentry, App Check (post-launch).

---

## Phase 2 — Astro takes over public pages (remaining)

### 2.3 — Public pages → 100% static Astro

| Page | Today | After |
|------|-------|-------|
| Home (`/`, `/en`) | `<HomeTemplate client:idle />` React island | Astro shell + `client:idle` vanilla script that `fetch('/api/standings')` + `fetch('/api/live')` |
| Tournament (`/torneo`, `/en/tournament`) | `<TournamentTemplate client:idle />` | Same pattern |
| Rankings (`/clasificacion`, `/en/rankings`) | `<RankingsTemplate client:idle />` | Same pattern |

After this, `MatchCard.tsx`, `MatchList.tsx`, `GroupStandings.tsx`, `TournamentHeader.tsx`, `RankingsTable.tsx`, `HomeTemplate.tsx`, `TournamentTemplate.tsx`, `RankingsTemplate.tsx` become deletable (see 4.3).

### 2.4 — Downgrade hydration (already at target)

| Page | Status |
|------|--------|
| Profile | ✅ Already `client:idle` |
| Admin matches | ✅ Already `client:idle` |

### 2.5c — Stop serializing translation dicts

- Remove `translations={` props from `PredictionsPage.astro`, `AuthPage.astro`.
- Components import from `@utils/i18n` directly.

### 2.6c — Delete middleware

- `src/middleware.ts` is unused; locale derived from URL path.

---

## Phase 4 — Cleanup (remaining)

### 4.3 — Final dead code purge (blocked on 2.3)

After Phase 2.3 ships, delete:
- `src/components/molecules/MatchCard/MatchCard.{tsx,css}`
- `src/components/organisms/MatchList/MatchList.{tsx,css}`
- `src/components/organisms/GroupStandings/GroupStandings.{tsx,css}`
- `src/components/organisms/TournamentHeader/TournamentHeader.{tsx,css}`
- `src/components/organisms/RankingsTable/RankingsTable.{tsx,css}`
- `src/components/templates/HomeTemplate/`
- `src/components/templates/TournamentTemplate/`
- `src/components/templates/RankingsTemplate/`

### 4.4 — Update migration plan docs

- Mark `.plan/ASTRO_MIGRATION_PLAN.md` Phase 6 actually-complete.
- Update `.plan/PHASE5_SSR_DEFERRED.md` to point at this plan.

---

## Phase 5 — CI / cron / hardening (post-launch)

### 5.1 — Daily rebuild (done)

- ✅ `.github/workflows/daily-rebuild.yml` exists.

### 5.2 — GitHub Actions CI pipeline

- [ ] `.github/workflows/ci.yml`: typecheck + lint + vitest on every PR
- [ ] `.github/workflows/deploy.yml`: build + deploy on push to `master`
- [ ] `.github/workflows/preview.yml`: Firebase Hosting preview channel for PRs

### 5.3 — Other hardening

| Item | Status |
|------|--------|
| Per-page CSP nonces (replace `'unsafe-inline'` in style-src) | Pending |
| Break up `PredictionsTemplate.tsx` | ✅ DONE — split into 4 step components |
| View transitions (`<ClientRouter />`) | ✅ DONE — adopted with fade transitions |
| Add Sentry / TrackJS | Before public launch |
| Firebase App Check | Before public launch |

---

## What we explicitly are NOT doing

- **Astro hybrid SSR / Firebase Functions adapter for pages** — explicitly deferred. Static + edge-cached `/api/*` is the chosen architecture.
- **Replacing Firestore client SDK on auth-gated pages** — predictions/profile need real-time writes; client SDK is correct there.
- **Astro API routes** — removed in Phase 0; Cloud Functions replace them.
- **Service Worker caching of dynamic data** — CDN does this better via `s-maxage`.
- **`[lang]` dynamic routes** — explicit locale paths (`/`, `/en/`) per AGENTS.md.

---

## Sequencing

```
Phase 2.3 (static pages, 3-4 days)
   │  Unblocks Phase 4.3
   ▼
Phase 4.3 (dead code purge, 1 day)
   │
Phase 4.4 (doc updates, 0.5 day) — can ship anytime
Phase 5.2 (CI workflows, 1 day) — can ship anytime
Phase 5.3 (hardening, post-launch)
```

Estimated total remaining work: **~1 week** of focused execution.

---

## Cost sanity check (still valid)

| Resource | Estimated usage at peak | Free tier | Status |
|----------|------------------------|-----------|--------|
| Cloud Functions invocations | ~130k/mo (1/min × 3 endpoints × 24h × 30d, edge-cached) | 2M/mo | OK |
| Firestore reads | ~150k/mo (functions only after Phase 2) | 50k/day = 1.5M/mo | OK |
| Hosting egress | ~20 GB/mo at WC traffic spike | 10 GB/mo free | Watch — Blaze plan at $0.15/GB beyond |
| Cloud Scheduler | 1 job, ~30/mo | 3 free jobs | OK |
