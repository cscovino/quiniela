
### Phase 1: Frontend UX improvements and responsive design fixes — COMPLETE

**Goal:** Fix mobile UX issues, improve responsive layout, and enhance accessibility across the prediction flow

**Status:** ✅ Complete — 9/9 plans, 428 tests passing, build succeeds

**Requirements**:

- Team names: show full name when space allows, fallback to FIFA code (3 letters) when truncated
- Mobile select dropdowns: proper sizing and positioning
- Back/Next buttons: match design system style with rounded pixelated corners (stepped edges, not smooth curves)
- Progress indicator: compact on mobile to reduce scrolling
- Bug: "Best Players" incorrectly marked as submitted after completing Group A
- Bug: TeamSelector shows empty after selecting a team
- Use rem units for font-size to respect user preferences
- Visual: make page more vibrant with tournament colors (currently feels boring)
- Visual: show tournament name prominently
- Mobile menu: clear visual separation from page behind (backdrop/overlay)
- Mobile menu: "Hacer Predicciones" button repositioned (not sandwiched between nav items)
- Mobile menu: display user's displayName (not email)
- Mobile menu: logout button more visible/prominent
- Mobile menu: active/highlighted option more prominent
- PWA: add visible install prompt/button
- Spinner: redesign to match pixel-art style (currently looks like spinning square)
- Mobile: eliminate horizontal scrolling completely
- PWA: implement cache-busting/version update mechanism to fetch latest site
- Predictor list UX: clarify row click vs edit button (row = edit predictions, button = edit name/avatar)
- Predictor list: make Edit/Delete buttons more visible with pixel-art icons
- Documentation: update README.md, DESIGN.md, and AGENTS.md to reflect current state and Phase 1 changes

**Plans:** 9/9 plans complete

Plans:

- [x] 01-01-PLAN.md — CSS rem migration, horizontal scroll fix, PWA manifest id
- [x] 01-02-PLAN.md — Bug fixes: Best Players false submission, TeamSelector empty selection
- [x] 01-03-PLAN.md — Component improvements: pixelated buttons, pixel-art spinner, responsive team names
- [x] 01-04-PLAN.md — Mobile UX: compact progress indicator, select dropdown sizing
- [x] 01-05-PLAN.md — Mobile menu: backdrop overlay, CTA repositioning, displayName, logout, active links, tournament name
- [x] 01-06-PLAN.md — Predictor list UX: row click clarity, pixel-art icons
- [x] 01-07-PLAN.md — PWA: install prompt component, cache-busting version update
- [x] 01-08-PLAN.md — Visual polish: WC26 tournament gradients
- [x] 01-09-PLAN.md — Documentation: README, DESIGN, AGENTS updates

### Phase 2: Create stories for all possible components so I can develop focusing in one component and then that would be reflected in all the app, for example the navbar, that now is allowing to scroll the background content and the header is not being sticky

**Goal:** Create Storybook stories for every missing component so components can be developed in isolation. Fix NavBar scroll-through bug and sticky positioning so background scrolling no longer bleeds through the mobile menu and the header sticks correctly.

**Status:** ✅ Complete — 7/7 plans, 516 tests passing, build succeeds

**Depends on:** Phase 1
**Plans:** 7/7 plans complete

Plans:

- [x] 02-01-PLAN.md — NavBar CSS fix (scroll lock + sticky) + 6 NavBar stories
- [x] 02-02-PLAN.md — AuthGuard, Toast, ToastProvider, PWAInstall stories
- [x] 02-03-PLAN.md — LoginForm, RegisterForm stories
- [x] 02-04-PLAN.md — PointsChart, PredictionsUI, PredictionStepFinal, AdminMatchResultForm stories
- [x] 02-05-PLAN.md — BestPlayersForm, FinalPhaseForm, GroupPredictionForm, KnockoutBracketForm stories
- [x] 02-06-PLAN.md — AdminMatchesPage, AdminMatchList stories
- [x] 02-07-PLAN.md — AuthTemplate, PredictionsTemplate stories + Astro page docs

### Phase 3: Check all LSP diagnostics and fix type errors

**Goal:** Eliminate all TypeScript errors, Astro diagnostics, and ESLint warnings across the project. Implement client-side data fetching so static pages show live data without rebuilds.

**Requirements:**
- Fix TS5101 `baseUrl` deprecation error via `ignoreDeprecations: "6.0"`
- Exclude build artifact directories from TypeScript checking to prevent `astro check` OOM crash
- Fix all 35 source TypeScript errors across 6 service files
- Fix ESLint warnings
- Create LiveMatchList, LiveStandings, LiveRankings container components
- Wire up Home, Tournament, Rankings pages with client:idle
- Fix NavBar mobile scroll lock

**Depends on:** Phase 2
**Plans:** 1 plan

Plans:

- [x] 03-01-PLAN.md — Fix tsconfig.json, fix all TS/ESLint errors, implement live data fetching, fix NavBar scroll lock

### Phase 4: Add Edit Profile UI to let users update their displayName and avatar from the profile page

**Goal:** Users can edit their displayName and avatar URL directly from the profile page — changes persist via Firebase Auth updateProfile + Firestore user doc dual-write, with immediate UI feedback through the Zustand store.

**Requirements:**
- Add `updateUserProfile` helper to auth-helpers.ts (updates Firebase Auth + Firestore)
- Add `updateProfile` action to the Zustand auth store
- Create EditProfileForm molecule component with displayName + avatarUrl inputs
- Wire edit toggle into ProfileTemplate below the UserProfile display
- Add i18n strings for edit profile (EN + ES)
- All existing tests pass, build succeeds

**Depends on:** Phase 3
**Plans:** 1 plan

Plans:

- [x] 04-01-PLAN.md — Add updateUserProfile helper + auth store action + EditProfileForm component + ProfileTemplate integration + i18n

### Phase 5: Replace all hardcoded tournament name strings with dynamic values from translations/config

**Goal:** Replace all hardcoded tournament name strings ("FIFA World Cup 2026", "WC26", "Mundial 2026", "Copa Mundial FIFA 2026") with dynamic values from i18n translation files, so the tournament name is centralized and easily changed for future editions.

**Status:** ✅ Complete — 1/1 plans, 516 tests passing, build succeeds

**Depends on:** Phase 4

**Additional work (post-plan):**
- Remove all "FIFA" brand references from locale files, stories, tests, CSS, and flagMapping.ts
- Add `locale` prop to TournamentHeader for locale-aware date formatting
- Fetch tournament doc (dates, status, participantCount) in build-data.ts
- Add TournamentHeader to home page and tournament page as static HTML

**Plans:** 1 plan

Plans:

- [x] 05-01-PLAN.md — Add tournament name keys to translations, update NavBar + BaseLayout JSON-LD, verify no hardcoded strings remain

### Phase 6: Replace emoji-based predictor avatars with lil_guy pixel art

**Goal:** Replace the emoji + bgColor predictor avatar system with deterministic `lil_guy` pixel art avatars, and refactor PredictorEditor to let users regenerate/cycle their predictor's lil_guy avatar.

**Status:** ⏸️ Skipped — `lil_guy` package not found on npm registry. Consider alternative pixel avatar libraries (DiceBear, random-pixel-avatar) for future implementation.

**Requirements:**
- Install `lil_guy` as a dependency (4KB gzipped, zero deps, deterministic SVG)
- Refactor `PredictorAvatar` component to render `lil_guy` SVG instead of emoji/initial, seeded from `predictor.id`
- Refactor `PredictorEditor` to replace emoji grid + color grid with a lil_guy preview and a "Regenerate" button that re-rolls the avatar (via a non-deterministic seed or cycling through variations)
- Update `Predictor` Firestore type: replace `avatar: { emoji, bgColor }` with `avatar: { seed?: string }` (optional override for the deterministic seed)
- Backfill existing predictors: keep current emoji+color as initial lil_guy seed or migrate gracefully
- Update PredictorAvatar stories to show lil_guy variants
- PredictorList and all other avatar consumers should work without changes (component API should stay compatible)

**Depends on:** Phase 1 (predictor components already stable)
**Plans:** 1 plan

Plans:

- [ ] 06-01-PLAN.md — Install lil_guy, refactor PredictorAvatar, refactor PredictorEditor with Regenerate, update types/stories/tests, ensure backward compat

### Phase 7: Evaluate and integrate driver.js for product tours/onboarding

**Goal:** Evaluate [driver.js](https://driverjs.com/) (lightweight, MIT, 25K GitHub stars) for product tours, feature highlights, and contextual help — then integrate into the prediction flow onboarding.

**Status:** ✅ Complete — 1/1 plans, 524 tests passing, build succeeds

**Requirements:**
- Research: install driver.js in a throwaway branch, prototype a tour for the prediction wizard flow (step-by-step guide through match predictions, group stage, knockout, best players)
- Evaluate tradeoffs: bundle size impact (driver.js ~7KB gzipped), pixel-art aesthetic compatibility (tour popover styling must match the retro design system), CSP compliance
- If approved: create a reusable `ProductTour` organism component that accepts step definitions as a config array
- Define tour steps for: first-time predictor creation, prediction wizard walkthrough, rankings explanation
- Persist completed tours in Firestore per-user or per-device (localStorage)
- Add "Start Tour" button / trigger points in the UI (predictions page, tournament page)
- Style the driver.js popover to match the pixel-art design system (Press Start 2P headings, 4px borders, blocky shadows, retro color palette)
- Update AGENTS.md with driver.js integration notes

**Depends on:** Phase 1 (predictor flow is stable)
**Plans:** 1 plan

Plans:

- [x] 07-01-PLAN.md — Evaluate driver.js (spike: prototype, CSP, bundle, styling) → if approved, integrate ProductTour component, pixel-art popover, persistence, trigger buttons, AGENTS.md

### Phase 8: Fix navigation performance and implement client-side data refresh

**Goal:** Eliminate the 2-second navigation lag by optimizing JS bundle sizes and reducing React island hydration overhead. Implement a silent client-side data refresh pattern so pages show live data without requiring daily rebuilds — without the previous 2s delay from client:idle.

**Status:** ✅ Complete — 524 tests passing, build succeeds, lint clean

**Requirements:**
- Profile and measure baseline: navigation timing, JS bundle composition, hydration cost per island
- Optimize the 353 KB i18n chunk (likely date-fns locale data — lazy-load or tree-shake)
- Optimize the 182 KB client chunk (React + Firebase — ensure code splitting, lazy-load non-critical modules)
- Consolidate React islands: merge ToastProvider into layout, remove unnecessary client:* directives
- Implement silent data refresh islands (LiveMatchList, LiveStandings, LiveRankings) using `client:load` with inline loading skeletons — starts from static HTML, then fetches live data post-hydration
- Ensure navigation completes in &lt;500ms on mid-tier connection (3G Slow throttled)
- Verify all 516+ tests still pass, lint clean, build succeeds

**Depends on:** Phase 4
**Plans:** 1 plan

Plans:

- [x] 08-01-PLAN.md — Performance audit, bundle optimization, island consolidation, data refresh pattern, verification

**Key changes:**
- Firebase modules split into dedicated `firebase.*.js` chunk (349K) for independent caching
- I18n chunk reduced to 4.2K via build-time inlining
- Astro prefetch enabled with `hover` strategy, `data-astro-prefetch` on all NavBar links
- `useLiveData` hook with 1-minute in-memory cache for silent data refresh
- `live-data-service.ts` provides fetchLiveMatches, fetchLiveStandings, fetchLiveRankings
- Home, Tournament, and Rankings pages wired with Live* v2 components using `client:load`
- Pages hydrate instantly from static HTML, then silently refresh data post-hydration

### Phase 9: Codebase cleanup: remove dead components, fix import path style, remove React 17 imports

**Goal:** Clean up dead code and standardize import patterns across the codebase. Remove components that only exist in Storybook (no app imports), fix barrel import paths (e.g., `@atoms/Typography` instead of `@atoms/Typography/Typography`), remove unnecessary `import React from 'react'` (React 19 auto-JSX), and fix any broken/misspelled imports.

**Requirements:**
- Analyze all components for dead code — components only imported in Storybook files should be flagged for removal
- Scan for import paths with duplicated component name (`@dir/Name/Name` pattern → `@dir/Name`)
- Remove `import React from 'react'` from all TSX files (React 19 JSX transform)
- Find and fix any broken imports (typos, wrong paths)
- Verify all 524+ tests pass, lint clean, build succeeds

**User note:** Analysis first — user will review dead component results before any deletions

**Depends on:** Phase 8
**Plans:** 2 plans

Plans:
- [x] 09-01-PLAN.md — Create barrel files + dead component analysis
- [x] 09-02-PLAN.md — Import path fixes (React namespace, barrel paths), import ordering ESLint rule, verification

### Phase 10: Fix data display issues, unify native buttons with design system Button, fix tour button not working

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 9
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 10 to break down)

### Phase 11: Refactor the Predictions wizard: matches score predictions editable until tournament start deadline; default all matches to draw for predicted standings; predicted standings pre-fill selects editable until deadline; Next button submits prediction (no separate submit button); Back button navigates to previous step, not predictions list; fix untranslated locale strings; fix CAPTCHA failing after 2 groups; fix duplicate Group H header text; pre-fill elimination round with predicted classification; populate knockout bracket fixture data (teams, dates, locations) from web source

**Goal:** Refactor Predictions wizard to support editable scores until deadline, fix scoring defaults, improve navigation (Next=Save, Back=preserve), audit locale/CAPTCHA/headers, fix knockout bracket assignments.
**Requirements**: A, B, C, D, E, F, G, H, I
**Depends on:** Phase 10
**Plans:** 4 plans

Plans:
- [ ] 11-01-PLAN.md — Editable scores: service layer (merge writes) + group form fixes (isMatchDisabled, allPredictions, duplicate header)
- [ ] 11-02-PLAN.md — Editable knockout form + bracket team assignment fix
- [ ] 11-03-PLAN.md — Navigation improvements (Next=Save, Back=preserve) + CAPTCHA flash fix
- [ ] 11-04-PLAN.md — Locale audit: missing predictions translations, replace hardcoded strings
