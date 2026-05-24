# Quiniela — Plan

> Single source of truth. Pending work organized by Phase.
> Audited from current source code (commit `952a5f1+`, audit pass 3).

---

## Status — shipped & verified

All earlier remediation phases are complete and verified in source:

| Area | Evidence |
|------|----------|
| **Hosting hygiene** | `firebase.json` — no SPA catch-all; `_astro/**` immutable; HTML no-cache; security headers; CSP; cleanUrls/trailingSlash. `.gitignore` covers `.firebase/`, `*.log`. |
| **`auth-store` listener leak fix** | `auth-store.ts:26, 123-129` |
| **Cloud Functions correct paths** | `functions/src/api/standings.ts:14-16`, `rankings.ts:13`, `live.ts:14-27` — query right Firestore paths, emit `Cache-Control: s-maxage=...` |
| **`firebase.json` `/api/*` rewrites** | `firebase.json:33-46` |
| **Single auth bootstrap** | `src/services/auth-bootstrap.ts` |
| **NavBar `astro:page-load` re-binding** | `src/scripts/nav-auth.ts:108-112` |
| **Lazy Firebase client SDK** | `firebase.ts:28-53` — `getDb()`, `getAuthInstance()`, `initPromise` |
| **Admin role via custom claims** | `auth-helpers.ts:120-121`, `scripts/set-admin-role.ts:24-28`, `firestore.rules:6-9` |
| **`useAuthStore` per-field selectors** | `PredictionsTemplate.tsx:172-173`, `ProfileTemplate.tsx:46-47` |
| **Form a11y** | `LoginForm.tsx:150`, `RegisterForm.tsx:105` — `role="alert" aria-live="polite"` |
| **SW lean PWA shell + PROD gate** | `public/sw.js` = 84 lines, `runtime.ts:9` gated on `import.meta.env.PROD` |
| **Orphans deleted** | `PWAInstall/`, `BracketView/`, `StandingsTemplate/` |
| **Daily rebuild CI** | `.github/workflows/daily-rebuild.yml` (cron `0 4 * * *`) |
| **View transitions** | `<ClientRouter />` in `BaseLayout.astro:107`; `<main transition:name="content" transition:animate="fade">` at `:147` |
| **`[lang]/[slug]` dynamic route** | `src/pages/[lang]/[slug].astro` + `src/utils/slug-map.ts` — locale derived from URL; localized slugs (`/es/torneo` ↔ `/en/tournament`). `src/middleware.ts` deleted. |
| **Public pages 100% static** | `[lang]/index.astro`, `[lang]/[slug].astro` — pure Astro shells with build-time data from `src/lib/build-data.ts` (firebase-admin SDK). No `client:*` on public routes. |
| **Old React templates deleted** | `HomeTemplate/`, `TournamentTemplate/`, `RankingsTemplate/` removed; current templates are `AuthTemplate`, `PredictionTemplate`, `PredictionsTemplate`, `ProfileTemplate` |
| **`@types` → `@app-types` alias rename** | `astro.config.ts:38`, `tsconfig.json:20`. Zero remaining `from '@types/` imports. |
| **CSP `'unsafe-inline'` in `style-src`** | Kept by design — Astro scoped styles require it. Deferred to nonces in Phase 2. |
| **Decision: Content Collections deferred** | `build-data.ts` reads via Admin SDK at build time; Content Collections would be redundant. Revisit if going offline-build. |

> `AuthGuard/` is **not** an orphan — actively used by `RankingsTemplate.tsx:121`, `TournamentTemplate.tsx:124` (note: these templates are deleted now too; verify AuthGuard's remaining consumers before any removal).

---

## Phase 1 — Cleanup & correctness (1 day) — COMPLETED

Issues surfaced by audit pass 3.

### 1.1 — Remove dead `fetch('/api/standings')` from home (HIGH) ✅
**File**: `src/pages/[lang]/index.astro`

- Removed the dead `fetch('/api/standings')` script that no-oped on the result.

### 1.2 — Replace fragile `displayName` reconstruction (HIGH) ✅
**Files**: `functions/src/api/rankings.ts`, `src/lib/build-data.ts`

- Now reads `displayName` from `users/{uid}/predictors/{predictorId}` doc (authoritative source).

### 1.3 — Declare Firestore composite index for `/api/live` ✅
**File**: `firestore/firestore.indexes.json`

- Index `(status ASC, date ASC)` on `matches` already declared.

### 1.4 — Add try/catch fallback in `build-data.ts` ✅
**File**: `src/lib/build-data.ts`

- Both `getBuildData()` and `getBuildRankings()` wrapped in try/catch, fall back to empty arrays.

### 1.5 — Harden `build-data.ts` non-null cast ✅
**File**: `src/lib/build-data.ts:109`

- Guard `result.home !== null && result.away !== null` before constructing view-model.

### 1.6 — Update `DESIGN.md` ✅
**File**: `DESIGN.md:222`

- Removed references to deleted `HomeTemplate`, `TournamentTemplate`, `RankingsTemplate`.

**Exit criteria**: home page has no dead fetch; rankings display name is authoritative; composite index declared; daily rebuild survives Firestore blip; docs match reality.

---

## Phase 2 — Pre-launch hardening (~1 week)

### 2.1 — Server-side auth gate on admin routes
**File**: `src/pages/[lang]/admin/matches.astro:21`

- Today: page is a static HTML shell with `client:idle` hydration. Unauthenticated visitors see the shell flash before the React `AuthGuard` kicks in.
- **Decision**:
  - **(A) Lightweight**: hide admin links in nav for non-admin users; rely on Firestore rules to reject any actual write. AuthGuard handles the visual flash.
  - **(B) Robust**: move admin behind a separate Firebase Hosting site with auth challenge, or use Cloud Functions HTTPS to proxy admin pages with token validation.

### 2.2 — Add Sentry or TrackJS
- Every prod error is currently invisible. Wire `BaseLayout.astro` to load Sentry (or TrackJS) — with nonce if/when nonces land (2.4).
- Surface unhandled rejections, React error boundaries, Cloud Function errors.

### 2.3 — Firebase App Check
- Now that `/api/{standings,rankings,live}` return real data, they're a real abuse target.
- Enable App Check on the three Cloud Function endpoints; verify client-side `appCheck` token attachment in lazy Firebase init.

### 2.4 — Per-page CSP nonces (optional)
- Phase 1 (prior audit) kept `'unsafe-inline'` in `style-src` because Astro scoped styles use inline `<style>`.
- If compliance later requires nonce-only CSP: Astro 6 supports per-request nonces via middleware. Larger refactor; defer until compliance signal arrives.

### 2.5 — Break up `PredictionsTemplate.tsx` (optional)
- 600 LOC god-object. Only do this if maintenance velocity drops; otherwise leave alone.

### 2.6 — Hosting preview channels per PR
- `.github/workflows/preview.yml` deploying to a Firebase Hosting preview channel on every PR.
- Quality-of-life for code review. Free tier.

---

## What we are NOT doing

- **Astro hybrid SSR** — deferred. Static + edge-cached `/api/*` is the architecture.
- **Replace Firestore client SDK on auth-gated routes** — predictions/profile/admin need real-time reads + writes.
- **Astro API routes** — removed; Cloud Functions own this surface.
- **Dynamic SW caching** — CDN does it better.
- **Delete `AuthGuard/`** — actively used (verify consumers before any future removal).
- **Remove `'unsafe-inline'` from CSP `style-src`** — Astro scoped styles require it.
- **Wire Content Collections** — `build-data.ts` via Admin SDK is the chosen path.

---

## File-by-file change summary (remaining)

| File | Phase | Action |
|------|-------|--------|
| `src/pages/[lang]/admin/matches.astro` | 2.1 | Decision A or B for admin auth gate |
| `BaseLayout.astro` (head) | 2.2 | Sentry/TrackJS script tag |
| `src/services/firebase.ts` | 2.3 | Add Firebase App Check init in lazy SDK path |
| `.github/workflows/preview.yml` | 2.6 | NEW — preview channel deploy |

---

## Sequencing

```
Phase 1 — Cleanup & correctness (1 day) — COMPLETED
   ├─ 1.1  Remove dead fetch — done
   ├─ 1.2  Authoritative displayName — reads from predictor doc
   ├─ 1.3  Composite index — already declared
   ├─ 1.4  Build try/catch — graceful fallback
   ├─ 1.5  Non-null guards — both home and away checked
   └─ 1.6  DESIGN.md — updated
   ▼
Phase 2 — Pre-launch hardening (~1 week, before public launch)
   ├─ 2.1  Admin auth gate
   ├─ 2.2  Sentry / TrackJS
   ├─ 2.3  Firebase App Check
   ├─ 2.4  CSP nonces (optional / compliance-driven)
   ├─ 2.5  PredictionsTemplate split (optional / maintenance-driven)
   └─ 2.6  Preview channels CI
```

**Total remaining**: ~1 day + ~1 week of pre-launch work. No P0 blockers. **Branch is launchable pending Phase 1 cleanup.**

---

## Cost sanity check

| Resource | Peak estimated | Free tier | Status |
|----------|----------------|-----------|--------|
| Cloud Functions invocations | ~130k/mo (1/min × 3 endpoints, edge-cached) | 2M/mo | OK |
| Firestore reads | ~150k/mo (functions only, no client refetch on public pages) | 1.5M/mo (50k/day) | OK |
| Hosting egress | ~20 GB/mo at WC peak | 10 GB/mo free | Watch — Blaze plan at $0.15/GB beyond |
| GitHub Actions minutes | ~30/mo (daily rebuild during tournament) | 2000/mo free | OK |
