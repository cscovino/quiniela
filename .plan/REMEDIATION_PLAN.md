# Quiniela — Remediation Plan

> Post-migration architectural cleanup. Anchored to the actual deployment target:
> **Astro static build + Firebase Hosting CDN + Firebase Cloud Functions (free tier)**.

## Goals

1. **Use Astro for what it's best at**: static HTML, Content Collections, partial hydration via islands.
2. **Use React only where interactivity demands it**: auth flows, prediction forms, profile, admin.
3. **Use Cloud Functions only for what changes daily**: standings, rankings, live match results — read-only, edge-cached endpoints.
4. **Stay inside Firebase free tiers**: Hosting CDN, Functions (2M invocations/mo), Firestore reads (50k/day).
5. **Stop client-side Firebase SDK from loading on public, anonymous-visible pages.**

## Architecture (target state)

```
                ┌──────────────────────────────────────────────────┐
                │              Firebase Hosting (CDN)              │
                │                                                  │
                │   Static HTML (Astro build)                      │
                │     ├─ Home, Tournament, Rankings shells         │
                │     ├─ Login, Register, Predictions, Profile     │
                │     │   pages (React island only on these)       │
                │     └─ /_astro/* hashed assets (immutable)       │
                │                                                  │
                │   Edge-cached JSON (via Functions rewrite)       │
                │     /api/standings   s-maxage=60                 │
                │     /api/rankings    s-maxage=60                 │
                │     /api/live        s-maxage=30                 │
                └────────────────────┬─────────────────────────────┘
                                     │
                       cache miss / revalidate
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │            Firebase Cloud Functions                │
        │                                                    │
        │   HTTPS readers (NEW):                             │
        │     standings.ts → reads groupStandings/*          │
        │     rankings.ts  → reads predictorStats/*          │
        │     live.ts      → reads matches/* where status=live│
        │                                                    │
        │   Firestore triggers (EXISTING, untouched):        │
        │     calculateMatchResult                           │
        │     updateGroupStandings  ─► writes aggregates     │
        │     updatePredictorStats  ─► writes aggregates     │
        │     checkAndAwardBadges                            │
        └────────────────────┬───────────────────────────────┘
                             │
                             ▼
                       ┌──────────┐
                       │ Firestore│
                       └──────────┘
```

**Key idea**: background triggers already maintain the aggregates. HTTPS functions just expose them. The CDN does the caching. The client never touches the Firebase SDK to view tournament state.

## Data freshness mapping

| Data | Cadence | Source |
|------|---------|--------|
| Teams, groups | Static for tournament | Content Collections (`src/content/`) |
| Match schedule | Rare changes | Content Collections + nightly rebuild |
| Match results | Per-match | `/api/live` (Function, 30s edge cache) |
| Group standings | After each match | `/api/standings` (Function, 60s edge cache) |
| User leaderboard | After each match | `/api/rankings` (Function, 60s edge cache) |
| User predictions | On submit | Firestore client SDK (auth-gated route only) |
| User profile | On edit | Firestore client SDK (auth-gated route only) |

---

## Phase 0 — Hosting hygiene (1 day)

Stop the active bleeding. Pure config changes, no app logic.

| # | Task | File |
|---|------|------|
| 0.1 | Remove the SPA catch-all rewrite | `firebase.json` `hosting.rewrites` |
| 0.2 | Add `headers`: `_astro/**` → `Cache-Control: public, max-age=31536000, immutable` | `firebase.json` |
| 0.3 | Add `headers`: `**/*.html` → `Cache-Control: no-cache, must-revalidate` | `firebase.json` |
| 0.4 | Add `headers`: security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`) | `firebase.json` |
| 0.5 | Move CSP from `<meta>` to `firebase.json` headers; keep `'unsafe-eval'` (Firebase Auth needs it), audit `'unsafe-inline'` removal next phase | `firebase.json`, `src/layouts/BaseLayout.astro:68-71` |
| 0.6 | Set `cleanUrls: true`, `trailingSlash: false` | `firebase.json` |
| 0.7 | Delete dead Astro API routes (don't ship in static mode) | `src/pages/api/matches.ts`, `src/pages/api/rankings.ts` |
| 0.8 | Add `.firebase/`, `*-debug.log` to `.gitignore`; remove tracked copies | `.gitignore`, repo root |
| 0.9 | Delete commented Firebase init block | `src/layouts/BaseLayout.astro:162-204` |
| 0.10 | Fix `initAuth` listener leak: cache the unsubscribe, make idempotent | `src/store/auth-store.ts:104-108` |

**Exit criteria**: clean `git status`, no 404s on production page load, CDN headers verified via `curl -I`.

---

## Phase 1 — Cloud Function endpoints + NavBar (3 days)

Build the dynamic-data layer that lets the public pages stop using the Firebase client SDK.

### 1.1 — Cloud Function HTTPS readers

Add to `functions/src/api/`:

```ts
// functions/src/api/standings.ts
export const standings = functions
  .runWith({ minInstances: 0 })
  .https.onRequest(async (req, res) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.set('Access-Control-Allow-Origin', '*');
    const snap = await db.collection('groupStandings').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
```

Mirror for `rankings` (reads `predictorStats/*`, sorted, top-N) and `live` (reads `matches/*` where `status == 'live' || status == 'finished' && finishedAt > now() - 1h`).

Wire in `firebase.json`:
```json
"rewrites": [
  { "source": "/api/standings", "function": "standings" },
  { "source": "/api/rankings",  "function": "rankings" },
  { "source": "/api/live",      "function": "live" }
]
```

Export from `functions/src/index.ts`.

### 1.2 — NavBar auth visibility (BLOCKING BUG)

**Symptom**: nav links are hidden on every page, login or no login, desktop and mobile. The desktop login/user widget never shows. Hamburger opens an empty mobile menu.

**Root cause**: `NavBar.astro` renders all auth-aware containers with inline `style="display: none;"` (lines 37, 85, 143, 158, 175) intending a JS toggler to flip them on hydration. The toggler was the now-commented-out Firebase block in `BaseLayout.astro:162-204`. With no toggler, the containers stay hidden forever. Inline `display: none` also wins over the desktop `@media (min-width: 1024px) { .nav-bar__links { display: flex } }` rule by CSS specificity (inline beats class), so even on desktop the public links never appear.

**Fix** — vanilla script in `NavBar.astro` (Option A, keeps anonymous pages React-free):

```astro
<script>
  import { useAuthStore } from '@store/auth-store';
  import { initAuth } from '@services/auth-bootstrap'; // from 1.3

  const links       = document.querySelector('[data-auth-links]');
  const desktopUser = document.querySelector('[data-auth-desktop]');
  const desktopLogin = document.querySelector('[data-auth-login]');
  const mobileLinks = document.querySelector('[data-auth-mobile-links]');
  const mobileUser  = document.querySelector('[data-auth-mobile-user]');
  const mobileCta   = document.querySelector('[data-auth-mobile-cta]');
  const mobileLoginCta = document.querySelector('[data-auth-mobile-login-cta]');
  const usernameEls = document.querySelectorAll('[data-auth-username], [data-auth-mobile-username]');

  function render(user) {
    // Public links: always visible (they're public). Showing only when JS runs was a defensive
    // measure to dodge a hydration mismatch that no longer applies — show them unconditionally.
    if (links)       links.style.display = '';
    if (mobileLinks) mobileLinks.style.display = '';

    // Auth-dependent toggles
    if (user) {
      if (desktopUser)    desktopUser.style.display = '';
      if (desktopLogin)   desktopLogin.style.display = 'none';
      if (mobileUser)     mobileUser.style.display = '';
      if (mobileCta)      mobileCta.style.display = '';
      if (mobileLoginCta) mobileLoginCta.style.display = 'none';
      usernameEls.forEach((el) => { el.textContent = user.displayName || user.email || ''; });
    } else {
      if (desktopUser)    desktopUser.style.display = 'none';
      if (desktopLogin)   desktopLogin.style.display = '';
      if (mobileUser)     mobileUser.style.display = 'none';
      if (mobileCta)      mobileCta.style.display = 'none';
      if (mobileLoginCta) mobileLoginCta.style.display = '';
    }
  }

  // Initial paint with current store state, then subscribe.
  render(useAuthStore.getState().user);
  useAuthStore.subscribe((state) => render(state.user));

  // Logout buttons
  document.getElementById('logout-btn')?.addEventListener('click', () => useAuthStore.getState().logout());
  document.getElementById('mobile-logout-btn')?.addEventListener('click', () => useAuthStore.getState().logout());

  // Kick off the single auth bootstrap (idempotent — see 1.3).
  initAuth();
</script>
```

**Companion change in `NavBar.astro`**: remove the inline `style="display: none;"` from the *public* links containers (`[data-auth-links]` line 37, `[data-auth-mobile-links]` line 143). They should be visible by default; keep CSS responsive rules to hide on mobile/desktop as appropriate. Only the auth-dependent containers (`[data-auth-desktop]`, `[data-auth-login]`, `[data-auth-mobile-user]`, `[data-auth-mobile-cta]`, `[data-auth-mobile-login-cta]`) keep an initial hidden state, and the script above resolves them on first paint.

**Why this works on Firebase Hosting static**: the script runs on every page after `auth-bootstrap.ts` resolves the Firebase `onAuthStateChanged` once. No SSR auth, no client-only-auth flicker (because public links show unconditionally), no React needed for the nav.

**Caveat**: there's a brief window (~50-150ms) between first paint and Firebase auth resolution where the user's `data-auth-desktop`/`data-auth-login` will reflect logged-out state even for logged-in users. Mitigate with a `localStorage.getItem('quiniela_auth_uid')` hint cached on login/logout that the script reads synchronously and uses as the initial render assumption. Source of truth still becomes Firebase once resolved.

**Alternatives** (kept for record, both more expensive):
- (B) Tiny `client:only` React mini-component (`NavBarAuth.tsx`) for just the auth-aware portion. Easier to maintain but ships React on anonymous page loads.
- (C) Astro `<ClientRouter />` + persisted store. Requires adopting view transitions properly — Phase 5 territory.

### 1.3 — Single auth bootstrap

- Move `onAuthStateChanged → Zustand` setup to a single module loaded once (lazy-imported by the NavBar script above and by the React islands on auth-gated routes).
- Remove `initAuth()` calls from `HomeTemplate`, `PredictionsTemplate`, `ProfileTemplate`, `AuthGuard`.
- Remove orphan `window.dispatchEvent('authStateChanged')` from `LoginForm`, `RegisterForm`.

---

## Phase 2 — Take real advantage of Astro (1 week)

Move public pages to static-shell + edge-data pattern. Remove React + Firebase from anonymous traffic.

### 2.1 — Wire Content Collections into templates

- `getCollection('teams')` and `getCollection('groups')` in `.astro` frontmatter for Home, Tournament, Rankings.
- Pass static team metadata via props instead of letting React refetch from Firestore.

### 2.2 — Build-time tournament data

- Create `src/lib/build-data.ts` using existing `src/lib/firebase-admin.ts` to fetch match schedule + last-known standings at build time.
- Used by Tournament and Home page frontmatter.
- This is the "stale shell" — refreshed by client-side `/api/...` fetches after first paint.

### 2.3 — Public pages → 100% static Astro

| Page | Today | After |
|------|-------|-------|
| Home (`/`, `/en`) | `<HomeTemplate client:load>` React island | Astro shell + tiny vanilla `client:idle` script that `fetch('/api/standings')` and `fetch('/api/live')` to patch live cells |
| Tournament (`/torneo`, `/en/tournament`) | `<TournamentTemplate client:load>` React island | Same pattern |
| Rankings (`/clasificacion`, `/en/rankings`) | `<RankingsTemplate client:load>` React island | Same pattern |

Delete now-unused React templates: `HomeTemplate.tsx`, `TournamentTemplate.tsx`, `RankingsTemplate.tsx`, `StandingsTemplate.tsx`.

### 2.4 — Auth-gated pages → React islands stay, downgrade hydration

| Page | Today | After |
|------|-------|-------|
| Login (`/login`) | `client:load` | `client:load` (needs immediate interactivity) |
| Register (`/register`) | `client:load` | `client:load` |
| Predictions (`/predicciones`) | `client:load` | `client:load` (form-heavy, needs immediate interactivity) |
| Profile (`/perfil`) | `client:load` | `client:idle` (below-fold, can defer) |
| Admin (`/en/admin/matches`) | `client:load` | `client:idle` |
| ToastProvider (layout) | `client:load` | `client:idle` |

### 2.5 — Consolidate i18n

- Single source: `src/utils/i18n.ts`.
- Remove inline `locale === 'en' ? ...` ternaries from all templates.
- Each component imports only the translation namespace it needs (not full dict via props).
- Stop serializing full translation dicts into HTML `astro-island props=`.

### 2.6 — Collapse duplicate page pairs

- `src/pages/[lang]/...` dynamic route with `getStaticPaths` returning `[{lang:'en'},{lang:'es'}]`.
- One file per logical page instead of two (`predicciones.astro` + `en/predictions.astro` → one `[lang]/predictions.astro`).
- Delete `src/middleware.ts` (locale already derived from URL).

---

## Phase 3 — Lazy Firebase + correctness (3 days)

Get Firebase SDK out of pages that don't need it; fix admin role detection.

### 3.1 — Lazy-init Firebase client SDK

- `src/services/firebase.ts` exports `getAuth()`, `getDb()` instead of singletons.
- Each function initializes on first call only.
- Auth-gated route bundles still include Firebase, but anonymous pages don't.
- Verify with `astro build && du -sh dist/_astro/` — expect ~40-60% reduction in critical bundle.

### 3.2 — Fix admin role detection via custom claims

- Cloud Function (HTTPS, admin-protected) sets Firebase Auth custom claims: `auth.setCustomUserClaims(uid, {role: 'admin'})`.
- `auth-helpers.ts:89-105` reads role from `idTokenResult.claims.role` instead of synthesizing it.
- Update `scripts/set-admin-role.ts` to call the new Function instead of writing Firestore directly.
- Update Firestore security rules to check `request.auth.token.role == 'admin'`.

### 3.3 — Store hygiene

- `useAuthStore` consumers use per-field selectors or `useShallow` everywhere — never raw destructure.
- Audit `AuthGuard.tsx:21`, `PredictionsTemplate.tsx:166`, `ProfileTemplate.tsx:46`.

### 3.4 — Form correctness

- Add `role="alert" aria-live="polite"` on error regions in `LoginForm`, `RegisterForm`.
- Surface client-side validation failures (empty display name, password mismatch) instead of silent `return`.

---

## Phase 4 — Refresh cadence + cleanup (2 days)

### 4.1 — Daily rebuild during tournament

- Cloud Scheduler job triggers GitHub Actions workflow at 04:00 UTC daily.
- Workflow runs `astro build && firebase deploy --only hosting`.
- Picks up schedule changes baked into Content Collections.
- Only needed during `2026-06-01` → `2026-07-25`.

### 4.2 — Service Worker shrink

- With CDN-level caching from Phase 0, the SW barely matters for asset caching.
- Reduce `sw.js` to: PWA install handling, push notifications, offline fallback page only.
- Remove dynamic cache logic (CDN handles it better).

### 4.3 — Dead code purge

Delete or wire in:
- `src/components/molecules/MatchCard/MatchCard.astro`
- `src/components/organisms/MatchList/MatchList.astro`
- `src/components/organisms/GroupStandings/GroupStandings.astro` (if unused after Phase 2)
- `src/components/organisms/TournamentHeader/TournamentHeader.astro` (if unused)
- `src/components/organisms/RankingsTable/RankingsTable.astro` (if unused)
- `src/components/organisms/BracketView/BracketView.tsx` (orphan)
- `src/components/organisms/PWAInstall/PWAInstall.tsx` (orphan)
- `src/components/templates/StandingsTemplate/` (orphan)

### 4.4 — Update migration plan docs

- Mark `.plan/ASTRO_MIGRATION_PLAN.md` Phase 6 as actually-complete (or replaced by this doc).
- Update `.plan/PHASE5_SSR_DEFERRED.md` with the explicit "static + CF endpoints" decision recorded here.

---

## Phase 5 — Optional hardening (1 week, post-launch)

| Item | When to do it |
|------|---------------|
| Break up `PredictionsTemplate.tsx` (600 LOC god-object) into per-step components | If maintenance velocity drops |
| Tighten CSP: remove `'unsafe-inline'` via per-page nonces | After Phase 0 CSP is in headers |
| Adopt Astro `<ClientRouter />` (or remove `view-transition-name: root` dead config) | Decide: real view transitions or not |
| Add Sentry or TrackJS | Before public launch |
| Firebase App Check | Before public launch (prevents non-app traffic abuse) |
| Firebase Hosting preview channels in CI | Quality-of-life for PR review |

---

## What we explicitly are NOT doing

- **Astro SSR / hybrid mode** — would require a Cloud Functions/Run runtime adapter, cold starts, cost. Defer indefinitely.
- **Replacing Firestore client SDK on auth-gated pages** — predictions and profile need real-time writes; client SDK is correct there.
- **Astro API routes** — removed in Phase 0. They don't ship in static mode. Cloud Functions replace them.
- **Service worker caching of dynamic data** — the CDN does this better via `s-maxage`. SW becomes a PWA shell only.

---

## Cost estimate (free tier sanity check)

Assumes peak WC26 traffic ~10k unique daily visitors during tournament.

| Resource | Estimated usage | Free tier | Status |
|----------|----------------|-----------|--------|
| Cloud Functions invocations | 1 per `/api/*` per 60s × 3 endpoints × 24h × 30d = ~130k/mo | 2M/mo | OK |
| Firestore reads | ~150k/mo (functions only; clients cached) | 50k/day = 1.5M/mo | OK |
| Hosting egress | ~20 GB/mo (HTML+JS+JSON) | 10 GB/mo | **Watch** — may need Blaze plan if traffic spikes |
| Hosting storage | ~10 MB build artifacts | 10 GB | OK |
| Cloud Scheduler | 1 job, ~30 invocations/mo | 3 free jobs | OK |

If egress goes over, the Blaze plan kicks in at $0.15/GB beyond 10 GB — negligible.

---

## File-by-file change summary

| File | Phase | Action |
|------|-------|--------|
| `firebase.json` | 0 | Add headers, fix rewrites, set cleanUrls |
| `.gitignore` | 0 | Add .firebase/, *.log |
| `src/store/auth-store.ts` | 0 | Fix listener leak |
| `src/layouts/BaseLayout.astro` | 0 | Delete commented block; move CSP to headers |
| `src/pages/api/*.ts` | 0 | Delete (replaced by Cloud Functions) |
| `functions/src/api/standings.ts` | 1 | NEW |
| `functions/src/api/rankings.ts` | 1 | NEW |
| `functions/src/api/live.ts` | 1 | NEW |
| `functions/src/index.ts` | 1 | Export new HTTPS functions |
| `src/components/organisms/NavBar/NavBar.astro` | 1 | Add auth-state subscription script |
| `src/services/auth-bootstrap.ts` | 1 | NEW; single auth init module |
| `src/components/templates/*Template.tsx` | 1 | Remove `initAuth()` calls |
| `src/components/molecules/{Login,Register}Form.tsx` | 1 | Remove orphan event dispatch |
| `src/pages/index.astro`, `torneo.astro`, `clasificacion.astro` (+ en/) | 2 | Convert to static Astro (no React island) |
| `src/lib/build-data.ts` | 2 | NEW |
| `src/utils/i18n.ts` | 2 | Become single i18n source |
| `src/pages/[lang]/*.astro` | 2 | NEW (consolidate duplicates) |
| `src/middleware.ts` | 2 | Delete |
| `src/services/firebase.ts` | 3 | Lazy init |
| `src/services/auth-helpers.ts` | 3 | Read role from custom claims |
| `functions/src/api/setUserRole.ts` | 3 | NEW (admin only) |
| `scripts/set-admin-role.ts` | 3 | Call Function instead of direct write |
| `public/sw.js` | 4 | Shrink to PWA shell only |
| `.plan/ASTRO_MIGRATION_PLAN.md` | 4 | Update completion status |

---

## Sequencing rationale

- **Phase 0 first**: pure config, zero risk, immediate wins (security headers, cache control, listener leak).
- **Phase 1 before 2**: must have `/api/*` endpoints working before public pages can rely on them.
- **Phase 2 before 3**: lazy Firebase only matters after we know which pages still need it.
- **Phase 3 separately**: admin role fix touches security rules; isolate the risk.
- **Phase 4 last**: cleanup once new architecture is proven in prod.
- **Phase 5 optional**: post-launch, traffic-data-driven decisions.

Estimated total: **~3 weeks of focused work** to reach the target architecture.
