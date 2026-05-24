# Quiniela — Plan

> Single source of truth. Pending work organized by Phase.
> Generated from a fresh audit on `noram-2026 @ 952a5f1`.

---

## Status — what's already shipped

| Area | Evidence |
|------|----------|
| **Hosting hygiene** | `firebase.json` — no SPA catch-all; `_astro/**` immutable; HTML no-cache; security headers; CSP; cleanUrls; trailingSlash. `.gitignore` covers `.firebase/`, `*.log`. `src/pages/api/` removed. |
| **`auth-store` listener leak fix** | `auth-store.ts:26, 123-129` |
| **Cloud Function endpoints** | `functions/src/api/{standings,rankings,live,setUserRole}.ts` exist (but with bugs — see Phase 1) |
| **`firebase.json` rewrites `/api/*`** | `firebase.json:33-46` |
| **Single auth bootstrap** | `src/services/auth-bootstrap.ts` |
| **NavBar `astro:page-load` fix** | `src/scripts/nav-auth.ts:111-115` |
| **Orphan `dispatchEvent` removed** | confirmed via grep |
| **Lazy Firebase** | `firebase.ts:28-53` — `getDb()`, `getAuthInstance()`, `initPromise` |
| **Admin role via custom claims** | `auth-helpers.ts:120-121`, `scripts/set-admin-role.ts:24-28` uses `httpsCallable('setUserRole')`, `firestore.rules:6-9` |
| **`useAuthStore` per-field selectors** | `PredictionsTemplate.tsx:172-173`, `ProfileTemplate.tsx:46-47` |
| **Form a11y** | `LoginForm.tsx:150`, `RegisterForm.tsx:105` — `role="alert" aria-live="polite"` |
| **SW lean PWA shell** | `public/sw.js` = 84 lines |
| **Orphans deleted** | `PWAInstall/`, `BracketView/`, `StandingsTemplate/` |
| **Daily rebuild CI** | `.github/workflows/daily-rebuild.yml` (cron `0 4 * * *`) |
| **View transitions** | `<ClientRouter />` in `BaseLayout.astro:3,106` |

> **Note**: `AuthGuard/` is **not** an orphan — actively used by `RankingsTemplate.tsx:121`, `TournamentTemplate.tsx:124`. Do not delete.

---

## Phase 1 — Fix broken `/api/*` endpoints (1 day, HIGHEST PRIORITY)

**Context**: The Firestore database has real data populated. All three `/api/*` Cloud Functions are currently querying **wrong collection paths**, so they return empty arrays in production. The frontend masks this today via direct Firestore reads in templates — but Phase 2 will lean on these endpoints, at which point every public page goes blank.

### 1.1 — `/api/standings` — fix collection path
**File**: `functions/src/api/standings.ts:13`

- Currently queries: `db.collection('groupStandings')`
- Should query: `db.collection('tournaments').doc('world-cup-2026').collection('group_standings')`
- Reference: `src/lib/build-data.ts:58`, `src/services/firestore-helpers.ts:46-51`, `functions/src/updateGroupStandings.ts:140`

### 1.2 — `/api/rankings` — fix collection path
**File**: `functions/src/api/rankings.ts:13-17`

- Currently queries: `db.collection('predictorStats')`
- Should query: `db.collectionGroup('stats')` filtered by tournament; join to predictor info
- Reference: `firestore.rules:56`, `src/lib/build-data.ts:138`

### 1.3 — `/api/live` — fix collection path + schema
**File**: `functions/src/api/live.ts:17-22`

- Currently queries: `db.collection('matches')` filtered by `finishedAt`
- Should query: `db.collection('tournaments').doc('world-cup-2026').collection('matches')`
- Schema fix: there is no `finishedAt` field — use `date` (`Timestamp`) + `status` (`'live' | 'finished'`)

### 1.4 — Smoke test
- `curl https://<region>-<project>.cloudfunctions.net/standings | jq 'length'` returns > 0
- Same for `rankings` and `live`
- Verify edge cache: response headers include `Cache-Control: public, s-maxage=...`

**Exit criteria**: All three endpoints return real data; CDN caching headers verified.

---

## Phase 2 — Critical cleanup (2 days)

### 2.1 — Remove `'unsafe-inline'` from CSP `style-src`
**File**: `firebase.json:83`

- Currently: `style-src 'self' 'unsafe-inline'`
- `BaseLayout.astro` has no inline `<style>` blocks; Astro scoped styles compile to external `_astro/*.css`.
- Deploy to a Hosting preview channel without `'unsafe-inline'`; if styles break, keep it and queue per-page nonces in Phase 4.

### 2.2 — Drop the double-fetch pattern
**Files**: `src/components/templates/{Home,Tournament,Rankings}Template.tsx`

- Today: `src/lib/build-data.ts` fetches at build time *and* templates `useEffect`-refetch from Firestore at runtime (`HomeTemplate.tsx:132-148`). The runtime overwrites the build data. We pay twice.
- Remove the `useEffect` Firestore refetch. Templates consume props from build-data, refresh via `fetch('/api/*')` after first paint.
- Removes the Firebase client SDK from public-page bundles entirely.

### 2.3 — Resolve i18n routing
**Files**: `src/pages/{index,torneo,clasificacion,predicciones,perfil,login,register}.astro` + `src/pages/en/{...}.astro` (dual-tree today)

Templates also contain dozens of inline `locale === 'en' ? 'X' : 'Y'` ternaries (`HomeTemplate.tsx:108,118,127,243,254`; `PredictionsTemplate.tsx:320,378,383,402,407,447,459-465`; etc.).

**Pick one**:
- **(A)** Collapse to `src/pages/[lang]/*.astro` dynamic route with `getStaticPaths` → delete `src/pages/en/*` siblings → keep or delete `src/middleware.ts` (locale derives from URL either way).
- **(B)** Accept dual tree, centralize strings via `src/utils/i18n.ts` (`getNavLinks` already exists), delete every inline ternary, expose a `t(key)` helper.

**Recommended**: (A). One file per page, simpler `<ClientRouter />` behavior, single source of truth.

### 2.4 — Gate service worker on production
**File**: `src/scripts/runtime.ts:9-13`

- Wrap registration in `if (import.meta.env.PROD) { ... }` so dev doesn't ship the SW.

### 2.5 — Rename `@types` path alias
**File**: `astro.config.ts:41` + every import using `@types/firestore` (~10 files)

- Currently collides with the npm `@types/*` scope.
- Rename alias to `@app-types` or `@models`.
- Verify: `grep -rl "from '@types/" src/`, then mass-rename.

### 2.6 — Wire Content Collections into templates
**Files**: `src/content/{teams,groups}/*.json` (already exist + validated by `content.config.ts`)

- Templates still don't call `getCollection('teams')` / `getCollection('groups')`. Static team metadata is re-fetched from Firestore on every page load.
- Wire into `index.astro`, `torneo.astro`, `clasificacion.astro` (+ `en/` siblings or `[lang]/` per 2.3 decision). Pass to templates as props.

**Exit criteria**: tight CSP, no double-fetch, single i18n strategy, no dev-mode SW, no alias collision, Content Collections in use.

---

## Phase 3 — Polish (3 days)

### 3.1 — Fix stale UID cache flash
**File**: `src/scripts/nav-auth.ts:89-94`

- Cached UID hint paints "logged in" with empty `displayName`/`email`. If user logged out from another tab, they see logged-in UI for ~50-200ms.
- Track a timestamp with the cached UID; treat older than N seconds as suspect; render neutral state until auth listener fires.

### 3.2 — Single auth init guard
**Files**: `src/services/auth-bootstrap.ts:5-9`, `src/store/auth-store.ts:124`

- Both guard against double-init. Keep `auth-store.ts` (real subscription owner); make `auth-bootstrap.ts` a thin pass-through call site.

### 3.3 — Surface form validation errors
**Files**: `src/components/molecules/RegisterForm/RegisterForm.tsx:51-57`, `LoginForm/LoginForm.tsx`

- Today: client-side validation failures (empty display name, password mismatch) silent-return.
- Surface via the `aria-live` region already in place (`role="alert"`).

### 3.4 — Initialize CodeGraph
- Project root `CLAUDE.md` asks for `.codegraph/`; not present.
- Run `codegraph init -i`.
- Speeds future explore/refactor work by ~5-10×.

### 3.5 — Migrate translation surface
**Files**: every template under `src/components/templates/`

- After Phase 2.3 (i18n routing decision), purge inline `locale === 'en' ? ...` ternaries.
- Move strings into `src/locales/{en,es}/*.json` (already exist) consumed via a `t(key)` helper.

**Exit criteria**: no auth flicker; one init guard; visible validation errors; CodeGraph live; templates clean of inline locale ternaries.

---

## Phase 4 — Hardening (post-launch, ~1 week)

| Item | Trigger |
|------|---------|
| Add Sentry or TrackJS | Before public launch — every prod error is invisible today |
| Firebase App Check | Before public launch — once `/api/*` returns real data (Phase 1), it becomes a real target |
| Per-page CSP nonces | If Phase 2.1 needs `'unsafe-inline'` retained |
| Break up `PredictionsTemplate.tsx` (600 LOC god-object) | If maintenance velocity drops |
| Polish view transitions CSS (fade-in/out tuning) | Quality of life |
| Hosting preview channels per PR | After CI matures |

---

## What we are NOT doing

- **Astro hybrid SSR / Cloud Functions adapter for pages** — explicitly deferred. Static + edge-cached `/api/*` is the architecture.
- **Replace Firestore client SDK on auth-gated routes** — predictions/profile/admin need real-time reads + writes; client SDK is correct there.
- **Astro API routes** — removed; Cloud Functions own this.
- **Dynamic SW caching** — CDN does it better.
- **Delete `AuthGuard/`** — actively used; old plan was wrong.

---

## File-by-file change summary (remaining work)

| File | Phase | Action |
|------|-------|--------|
| `functions/src/api/standings.ts:13` | 1.1 | Fix collection path → `tournaments/world-cup-2026/group_standings` |
| `functions/src/api/rankings.ts:13-17` | 1.2 | Switch to `collectionGroup('stats')` |
| `functions/src/api/live.ts:17-22` | 1.3 | Fix path; use `date` + `status` instead of `finishedAt` |
| `firebase.json:83` | 2.1 | Remove `'unsafe-inline'` from `style-src` |
| `src/components/templates/HomeTemplate/HomeTemplate.tsx:132-148` | 2.2 | Drop `useEffect` Firestore refetch; consume props + `/api/*` |
| `src/components/templates/TournamentTemplate/TournamentTemplate.tsx` | 2.2 | Same |
| `src/components/templates/RankingsTemplate/RankingsTemplate.tsx` | 2.2 | Same |
| `src/pages/en/*.astro` | 2.3 | Delete (if option A) — replaced by `[lang]/*.astro` |
| `src/pages/[lang]/*.astro` | 2.3 | NEW (if option A) |
| `src/middleware.ts` | 2.3 | Delete if `[lang]` resolves locale; keep if dual tree |
| `src/scripts/runtime.ts:9-13` | 2.4 | Gate SW registration on `import.meta.env.PROD` |
| `astro.config.ts:41` + imports | 2.5 | Rename `@types` alias |
| `src/pages/index.astro`, `torneo.astro`, `clasificacion.astro` (+ en/) | 2.6 | Wire `getCollection('teams' / 'groups')` |
| `src/scripts/nav-auth.ts:89-94` | 3.1 | Stale-cache mitigation |
| `src/services/auth-bootstrap.ts:5-9` | 3.2 | Single init guard |
| `src/components/molecules/RegisterForm/RegisterForm.tsx:51-57` | 3.3 | Surface validation errors |
| (CodeGraph) | 3.4 | `codegraph init -i` |
| `src/components/templates/**` | 3.5 | Strip inline `locale === 'en' ?` ternaries |
| Sentry / TrackJS / App Check / nonces | 4 | NEW (post-launch) |

---

## Sequencing

```
Phase 1 (1 day, HIGHEST PRIORITY)
   ├─ 1.1  /api/standings collection path
   ├─ 1.2  /api/rankings collection path
   ├─ 1.3  /api/live collection path + schema
   └─ 1.4  smoke test
   ▼
Phase 2 (2 days)
   ├─ 2.1  CSP style-src
   ├─ 2.2  Drop double-fetch
   ├─ 2.3  i18n routing (decide A or B)
   ├─ 2.4  SW dev gate
   ├─ 2.5  @types alias rename
   └─ 2.6  Content Collections wiring
   ▼
Phase 3 (3 days)
   ├─ 3.1  Stale UID cache flash
   ├─ 3.2  Single init guard
   ├─ 3.3  Form validation feedback
   ├─ 3.4  CodeGraph init
   └─ 3.5  Strip inline ternaries (depends on 2.3)
   ▼
Phase 4 (post-launch, open-ended)
```

**Total remaining**: ~1 week of focused work + open-ended Phase 4.

---

## Cost sanity check

| Resource | Peak estimated | Free tier | Status |
|----------|----------------|-----------|--------|
| Cloud Functions invocations | ~130k/mo (1/min × 3 endpoints, edge-cached) | 2M/mo | OK |
| Firestore reads | ~150k/mo (functions only after Phase 2.2) | 1.5M/mo (50k/day) | OK |
| Hosting egress | ~20 GB/mo at WC peak | 10 GB/mo free | Watch — Blaze plan at $0.15/GB beyond |
| GitHub Actions minutes | ~30/mo (daily rebuild during tournament) | 2000/mo free | OK |
