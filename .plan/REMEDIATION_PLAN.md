# Quiniela — Consolidated Remediation Plan

> Source of truth for remaining work after Phase 0 + significant Phase 1/3/4 progress.
> Last re-audited: 2026-05-23.

## Current state snapshot

### Already shipped

| Area | Status |
|------|--------|
| Phase 0 — Hosting hygiene | DONE (commit `0002dbd`) — except cosmetic `rmdir src/pages/api/` |
| Phase 1.1 — Cloud Function endpoints `/api/{standings,rankings,live}` | DONE — `functions/src/api/*.ts`, exported from `functions/src/index.ts` |
| Phase 1.3 — Single auth bootstrap (`auth-bootstrap.ts`) | DONE — `src/services/auth-bootstrap.ts` exists; per-template `initAuth()` calls removed |
| Phase 3.2 (partial) — Admin role via custom claims | MOSTLY DONE — `auth-helpers.ts:118-124` reads from `idTokenResult.claims.role`; `setUserRole` Cloud Function exists |
| Phase 4.2 — SW shrink to PWA shell | DONE — `public/sw.js` = 85 lines, PWA shell only |
| Phase 4.3 (partial) — Orphan deletion | DONE for `PWAInstall`, `BracketView`, `StandingsTemplate`, `AuthGuard` (already removed) |
| `auth-store.ts` listener leak fix | DONE — `:26-43, 123-129` (idempotent + cached unsubscribe) |
| `<ClientRouter />` adopted | DONE — `BaseLayout.astro:106` (introduces the new NavBar bug; see S1.1) |

### Active production blockers (do first)

1. **NavBar disappears after view transitions** — script's module-level DOM queries don't re-bind on `astro:page-load`.
2. **CSP `style-src 'self'` will break Astro scoped styles in production** — Astro inlines `<style>` per component; without `'unsafe-inline'` or nonces this gets blocked.
3. **Desktop `[data-auth-desktop]` / `[data-auth-login]` still hidden** by CSS even when the script runs correctly.

---

## Sprint 1 — Fix production blockers (1 day)

### S1.1 — NavBar re-binds on view transitions

**File**: `src/scripts/nav-auth.ts`

**Symptom**: nav links/auth widgets disappear after any client-side navigation.

**Root cause**: `nav-auth.ts:4-50` calls `document.querySelector(...)` at module top level, capturing DOM nodes once. Astro `<ClientRouter />` (`BaseLayout.astro:106`) swaps the NavBar DOM on every navigation. The script's references point at discarded nodes.

**Fix shape**:
```ts
function setup() {
  const links       = document.querySelector('[data-auth-links]');
  const desktopUser = document.querySelector('[data-auth-desktop]');
  // ...all queries inside setup()...
  // ...listeners + render() call inside setup()...
}

setup();                                              // first page load
document.addEventListener('astro:page-load', setup);  // every transition
```

**Companion**: subscribe to `useAuthStore` and bind the logout buttons inside `setup()` too, otherwise listeners stack on every navigation. Either return an unsubscribe + cleanup on `astro:before-swap`, or store the unsubscribe in a module-level var and call it before re-subscribing.

### S1.2 — Verify CSP doesn't break Astro scoped styles

**File**: `firebase.json:83`

**Risk**: `style-src 'self'` blocks the inline `<style>` blocks Astro generates per scoped component. Symptom would be: deployed pages have no styling, browser console full of CSP violations.

**Verify first**: deploy to a Hosting preview channel (`firebase hosting:channel:deploy test`) and check browser console. If violations appear:

**Option A (quick)**: Re-add `'unsafe-inline'` to `style-src` only (script-src stays tight). Astro scoped styles are still safer than arbitrary inline JS — the attack surface is much smaller.

**Option B (correct)**: Per-page CSP nonce. Astro 6 supports this via middleware that generates a nonce per request and writes it into `<style nonce="...">` tags. More work; do as Phase 5 hardening.

**Recommendation**: Option A now, Option B in Phase 5.

### S1.3 — Hide desktop auth widgets by JS, not CSS

**File**: `src/components/organisms/NavBar/NavBar.astro:404-410`

**Symptom**: even after S1.1, `[data-auth-desktop]` and `[data-auth-login]` stay hidden on desktop because CSS pins them `display: none` unconditionally.

**Fix**: remove the unconditional `display: none` rules; let the script in S1.1 set the initial state (and the cached UID hint in `auth-bootstrap.ts` if present prevents flicker).

### S1.4 — Misc cleanup

- `rmdir src/pages/api/` (empty after Phase 0 deletions)
- `src/scripts/nav-auth.ts:52` — fix implicit-any on `function render(user)`. Type it as `User | null` from `@types/firestore`.
- Remove orphan `window.dispatchEvent('authStateChanged')` from `LoginForm.tsx:67-68, 82-83` and `RegisterForm.tsx:67-68, 82-83`. No listeners; dead code.

**Sprint 1 exit criteria**: NavBar correct on first load + all client-side navigations + login/logout flips. CSP confirmed not breaking styles in a preview channel. `tsc --noEmit` clean.

---

## Phase 2 — Astro takes over public pages (1 week)

Move public pages to static-shell + edge-data pattern. Now unblocked since `/api/*` Cloud Functions are live.

### 2.1 — Wire Content Collections into templates

- `getCollection('teams')`, `getCollection('groups')` in `.astro` frontmatter for Home, Tournament, Rankings.
- Pass static team metadata via props instead of letting React refetch from Firestore.

### 2.2 — Build-time tournament data

- Create `src/lib/build-data.ts` using existing `src/lib/firebase-admin.ts`.
- Fetch match schedule + last-known standings at build time, inject into Home/Tournament/Rankings frontmatter.
- This becomes the "stale shell" — refreshed by client-side `fetch('/api/...')` calls.

### 2.3 — Public pages → 100% static Astro

| Page | Today | After |
|------|-------|-------|
| Home (`/`, `/en`) | `<HomeTemplate client:load>` React island | Astro shell + `client:idle` vanilla script that `fetch('/api/standings')` + `fetch('/api/live')` |
| Tournament (`/torneo`, `/en/tournament`) | `<TournamentTemplate client:load>` | Same pattern |
| Rankings (`/clasificacion`, `/en/rankings`) | `<RankingsTemplate client:load>` | Same pattern |

After this, `MatchCard.tsx`, `MatchList.tsx`, `GroupStandings.tsx`, `TournamentHeader.tsx`, `RankingsTable.tsx`, `HomeTemplate.tsx`, `TournamentTemplate.tsx`, `RankingsTemplate.tsx` become deletable (see 4.3).

### 2.4 — Downgrade hydration on remaining islands

| Page | Today | After |
|------|-------|-------|
| Login | `client:load` | `client:load` (needs immediate input) |
| Register | `client:load` | `client:load` |
| Predictions | `client:load` | `client:load` (form-heavy) |
| Profile | `client:load` | `client:idle` (below-fold) |
| Admin matches | `client:load` | `client:idle` |
| ToastProvider | `client:idle` already | unchanged |

### 2.5 — Consolidate i18n

- Single source: `src/utils/i18n.ts`.
- Remove inline `locale === 'en' ? ...` ternaries from all templates.
- Each component imports only the namespace it needs.
- Stop serializing full translation dicts into `astro-island props=`.

### 2.6 — Collapse duplicate page pairs

- One `src/pages/[lang]/...` dynamic route with `getStaticPaths: [{lang:'en'},{lang:'es'}]`.
- Replaces 6-7 duplicated page-pair files.
- Delete `src/middleware.ts` (locale derived from URL).

---

## Phase 3 — Lazy Firebase + correctness (3 days)

### 3.1 — Lazy-init Firebase client SDK

**File**: `src/services/firebase.ts`

- Export `getAuth()`, `getDb()` instead of singletons.
- Each function initializes on first call only.
- Verify post-build: `du -sh dist/_astro/` should drop ~40-60% for chunks that no longer touch Firebase (public-page bundles after Phase 2).

### 3.2 (remaining) — Finish custom claims migration

- Confirm `scripts/set-admin-role.ts` calls the `setUserRole` Cloud Function (not direct Firestore write).
- Update Firestore security rules to check `request.auth.token.role == 'admin'`.
- Smoke-test admin pages with a freshly-claimed user.

### 3.3 — Store hygiene

- Audit `useAuthStore` consumers for raw destructure → switch to per-field selectors or `useShallow`.
- Hot spots: `PredictionsTemplate.tsx:166`, `ProfileTemplate.tsx:46`.

### 3.4 — Form correctness

- Add `role="alert" aria-live="polite"` on error regions in `LoginForm.tsx:147-150`, `RegisterForm.tsx:109-118`.
- Surface client-side validation failures (empty display name, password mismatch) instead of silent `return` in `RegisterForm.tsx:51-57`.

---

## Phase 4 — Cleanup (1 day)

### 4.3 (remaining) — Final dead code purge

After Phase 2.3 ships, delete:
- `src/components/molecules/MatchCard/MatchCard.{astro,tsx,css}` (both versions)
- `src/components/organisms/MatchList/MatchList.{astro,tsx,css}`
- `src/components/organisms/GroupStandings/GroupStandings.{astro,tsx,css}`
- `src/components/organisms/TournamentHeader/TournamentHeader.{astro,tsx,css}`
- `src/components/organisms/RankingsTable/RankingsTable.{astro,tsx,css}`
- `src/components/templates/HomeTemplate/`
- `src/components/templates/TournamentTemplate/`
- `src/components/templates/RankingsTemplate/`

### 4.4 — Update migration plan docs

- Mark `.plan/ASTRO_MIGRATION_PLAN.md` Phase 6 actually-complete.
- Update `.plan/PHASE5_SSR_DEFERRED.md` to point at this plan.

---

## Phase 5 — CI / cron / hardening (post-launch, ~1 week)

### 5.1 — Daily rebuild during tournament

- Cloud Scheduler → GitHub Actions workflow at 04:00 UTC.
- Runs `astro build && firebase deploy --only hosting`.
- Picks up Content Collection edits (postponements, schedule corrections).
- Only active `2026-06-01` → `2026-07-25`.

### 5.2 — GitHub Actions CI pipeline

- `.github/workflows/ci.yml`: typecheck + lint + vitest on every PR
- `.github/workflows/deploy.yml`: build + deploy on push to `master`
- `.github/workflows/preview.yml`: Firebase Hosting preview channel for PRs

### 5.3 — Other hardening

| Item | Trigger / when |
|------|----------------|
| Per-page CSP nonces (replace `'unsafe-inline'` if S1.2 needed it) | After launch traffic confirms current CSP works |
| Break up `PredictionsTemplate.tsx` (600 LOC god-object) | If maintenance velocity drops |
| Polish view transitions (`<ClientRouter />` already adopted) | Quality of life |
| Add Sentry / TrackJS | Before public launch |
| Firebase App Check | Before public launch (blocks non-app traffic) |

---

## What we explicitly are NOT doing

- **Astro hybrid SSR / Firebase Functions adapter for pages** — explicitly deferred. Static + edge-cached `/api/*` is the chosen architecture.
- **Replacing Firestore client SDK on auth-gated pages** — predictions/profile need real-time writes; client SDK is correct there.
- **Astro API routes** — removed in Phase 0; Cloud Functions replace them.
- **Service Worker caching of dynamic data** — CDN does this better via `s-maxage`.

---

## File-by-file change summary (remaining work only)

| File | Sprint/Phase | Action |
|------|--------------|--------|
| `src/scripts/nav-auth.ts` | S1.1 | Wrap setup in function, bind to `astro:page-load`, handle re-subscribe cleanup, type `render(user)` |
| `src/components/organisms/NavBar/NavBar.astro` | S1.3 | Remove unconditional `display: none` on `[data-auth-desktop]` / `[data-auth-login]` (lines 404-410) |
| `firebase.json` | S1.2 | Audit `style-src 'self'`; add `'unsafe-inline'` to style-src if Astro styles break |
| `src/pages/api/` | S1.4 | `rmdir` (empty) |
| `src/components/molecules/LoginForm/LoginForm.tsx` | S1.4 | Remove orphan `dispatchEvent('authStateChanged')` (lines 67-68, 82-83) |
| `src/components/molecules/RegisterForm/RegisterForm.tsx` | S1.4 | Same removal (lines 67-68, 82-83) |
| `src/lib/build-data.ts` | 2.2 | NEW — build-time Firestore admin fetch |
| `src/pages/index.astro`, `torneo.astro`, `clasificacion.astro` + `en/` siblings | 2.3 | Convert to pure Astro shell + `client:idle` fetch script |
| `src/components/templates/{Home,Tournament,Rankings}Template.tsx` | 2.3 then 4.3 | Used by 2.3 in transition, deleted in 4.3 |
| `src/utils/i18n.ts` | 2.5 | Become single i18n source |
| `src/pages/[lang]/*.astro` | 2.6 | NEW — consolidate page pairs |
| `src/middleware.ts` | 2.6 | Delete |
| `src/services/firebase.ts` | 3.1 | Lazy init (`getAuth()`, `getDb()` getters) |
| `scripts/set-admin-role.ts` | 3.2 | Call `setUserRole` function instead of direct Firestore |
| `firestore/firestore.rules` | 3.2 | Check `request.auth.token.role == 'admin'` |
| `src/components/templates/PredictionsTemplate/PredictionsTemplate.tsx` | 3.3 | Per-field selectors via `useShallow` |
| `src/components/templates/ProfileTemplate/ProfileTemplate.tsx` | 3.3 | Same |
| `src/components/molecules/LoginForm/LoginForm.tsx` | 3.4 | `role="alert" aria-live="polite"` on error region |
| `src/components/molecules/RegisterForm/RegisterForm.tsx` | 3.4 | Same + surface client-side validation errors |
| Dead `.tsx` and `.astro` components | 4.3 | Delete after 2.3 |
| `.plan/ASTRO_MIGRATION_PLAN.md`, `.plan/PHASE5_SSR_DEFERRED.md` | 4.4 | Doc updates |
| Cloud Scheduler config | 5.1 | NEW |
| `.github/workflows/{ci,deploy,preview}.yml` | 5.2 | NEW |

---

## Sequencing

```
Sprint 1 (production blockers, 1 day)
   │
   ├─ S1.1 NavBar astro:page-load          ◄── unblocks login UX
   ├─ S1.2 CSP style-src verify
   ├─ S1.3 NavBar CSS hidden fix
   └─ S1.4 cleanup
   │
   ▼
Phase 2 (Astro public pages, 1 week)
   │  Independent slices — can ship 2.1, 2.3, 2.5, 2.6 incrementally
   ▼
Phase 3 (lazy Firebase + correctness, 3 days)
   │  3.1 depends on Phase 2 to verify the win
   │  3.2/3.3/3.4 independent — can parallelize
   ▼
Phase 4 (cleanup, 1 day)
   │  4.3 must come after 2.3
   │  4.4 can ship anytime
   ▼
Phase 5 (CI / cron / hardening, post-launch)
```

Estimated total remaining work: **~2 weeks** of focused execution.

---

## Cost sanity check (still valid)

| Resource | Estimated usage at peak | Free tier | Status |
|----------|------------------------|-----------|--------|
| Cloud Functions invocations | ~130k/mo (1/min × 3 endpoints × 24h × 30d, edge-cached) | 2M/mo | OK |
| Firestore reads | ~150k/mo (functions only after Phase 2) | 50k/day = 1.5M/mo | OK |
| Hosting egress | ~20 GB/mo at WC traffic spike | 10 GB/mo free | Watch — Blaze plan at $0.15/GB beyond |
| Cloud Scheduler | 1 job, ~30/mo | 3 free jobs | OK |
