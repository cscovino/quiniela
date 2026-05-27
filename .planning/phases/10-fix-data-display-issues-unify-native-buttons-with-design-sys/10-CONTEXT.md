# Phase 10: Fix data display issues, unify native buttons with design system Button, fix tour button - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix three interconnected issues: (1) data display bugs in LiveMatchList where tournament page shows only 5 matches (collections Group A partial data) and home page upcoming matches are stale/wrong, (2) unify ~14 native `<button>` elements across 6 components with the design system `<Button>` component including appropriate icons, (3) fix ProductTour button and first-predictor auto-tour not starting because `autoStart` prop was never passed.

**In scope:**
- Add `showAll` prop to LiveMatchList using existing `fetchAllMatches()` for tournament page
- Fix cache key collision (homepage vs tournament LiveMatchList + LiveStandings)
- Home page: increase limit to 6, use live fetch with SSR fallback
- Verify `fetchLiveMatches` today-inclusive filter works correctly (keep OR logic)
- Replace all non-tab native buttons with `<Button>` component using variant palette
- Remove old button-specific CSS after replacement
- Add pixelarticons icons to Login, Logout, Edit, Delete, Theme toggle, Back, Tour, Notifications bell
- Add Moon and new icon imports to Icon component, rename `star` → `sparkles`
- Fix ProductTour: add `autoStart={true}` to both instances (wizard + first-predictor)
- Add skeleton loading components (SkeletonMatchCard, SkeletonStandings, SkeletonRankings)
- Fix login button pattern in PredictionsTemplate (currently button-inside-anchor anti-pattern)

**Out of scope:**
- LoginForm/RegisterForm toggle buttons (leave as native)
- Tournament page tab buttons (leave as native — correct role="tab" pattern)
- New features beyond icons and button unification
- Backend or Firestore schema changes
- Phase 9 import ordering changes (already applied)

</domain>

<decisions>
## Implementation Decisions

### Data Display Fixes
- **D-01:** Add `showAll` boolean prop to LiveMatchList — when true, calls `fetchAllMatches()` instead of `fetchLiveMatches(limit)`. Simple prop, minimal change.
- **D-02:** Home page limit increased from 5 to 6 matches. Use SSR build-time data as initial state with live fetch refresh on hydration.
- **D-03:** `fetchLiveMatches` keeps current OR logic (today matches OR upcoming matches) — only shows today's matches if any exist that day.
- **D-04:** Fix cache key collision by passing unique `cacheKey` from each Astro page: `home-matches`, `tournament-matches`, `tournament-standings`.
- **D-05:** Build-time data still passed as `initialMatches` for SSR content — not removed, just not relied upon for correctness.

### Button Unification
- **D-06:** All non-tab native buttons → design system `<Button>` component.
- **D-07:** Variant palette: Back/dismiss → `ghost`, Login/submit/install → `primary`, Delete → `danger`, Tour → `accent`, Edit → `secondary`, New prediction → `primary`, NavBar hamburger/logout/notifications/theme → `ghost`.
- **D-08:** NavBar login link stays as `<a>` (not button) but gets Login icon added.
- **D-09:** Old button-specific CSS removed from all affected component CSS files after replacement.
- **D-10:** LoginForm/RegisterForm toggle links stay as native (not buttons).
- **D-11:** Tournament page tabs stay as native `<button role="tab">` (correct ARIA pattern).

### Tour Button Fix
- **D-12:** Add `autoStart={true}` to both `<ProductTour>` instances in PredictionsTemplate (wizard + first-predictor).
- **D-13:** Tour button uses `<Button variant="accent">` with RobotFace pixelarticons icon (no emoji).

### Icons
- **D-14:** Add to Icon.tsx: `Moon` (theme toggle dark), rename `star` → `sparkles` (theme toggle light), `PenSquare` (edit), `Trash` (delete), `ChevronLeft` (back), `RobotFace` (tour), `Bell` (already imported), `Login` (already imported), `Logout` (already imported).
- **D-15:** PredictorList: replace `pix-edit` spans with PenSquare icon, `pix-trash` spans with Trash icon in `<Button>` component.
- **D-16:** NavBar theme toggle: Moon icon when dark theme, Sparkles icon when light theme.

### Loading States
- **D-17:** Add skeleton loading components: `SkeletonMatchCard`, `SkeletonStandings`, `SkeletonRankings`.
- **D-18:** Skeleton components placed in `@molecules/` directory.

### the agent's Discretion
- Exact import grouping placement for new pixelarticons imports (follow Phase 9 conventions).
- Specific `size` prop values for each icon instance (default 18-24 range).
- Skeleton animation/styling details (consistent with retro pixel-art theme).
- The `+` icon for the "New prediction" button (could use existing pixelarticons or stay as `+`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core files to modify
- `src/services/live-data-service.ts` — `fetchLiveMatches`, `fetchAllMatches` functions
- `src/hooks/useLiveData.ts` — `useLiveData` hook with cache and TTL
- `src/components/organisms/LiveMatchList/LiveMatchList.tsx` — add `showAll` prop
- `src/components/organisms/LiveStandings/LiveStandings.tsx` — cacheKey prop
- `src/components/organisms/LiveRankings/LiveRankings.tsx` — loading states
- `src/components/organisms/ProductTour/ProductTour.tsx` — autoStart fix
- `src/components/atoms/Button/Button.tsx` — design system Button reference
- `src/components/atoms/Icon/Icon.tsx` — icon registry

### Astro pages (data display fixes)
- `src/pages/[lang]/index.astro` — home page, pass limit=6 and cacheKey
- `src/components/pages/TournamentPage.astro` — pass showAll and cacheKey
- `src/components/pages/RankingsPage.astro` — loading state

### Button unification targets
- `src/components/templates/PredictionsTemplate/PredictionsTemplate.tsx` — login, back, tour buttons
- `src/components/molecules/PredictorList/PredictorList.tsx` — edit, delete, new buttons
- `src/components/organisms/NavBar/NavBar.tsx` — theme toggle, logout, hamburger, notifications
- `src/components/organisms/PWAInstall/PWAInstall.tsx` — install, dismiss buttons

### CSS cleanup targets
- `src/components/templates/PredictionsTemplate/PredictionsTemplate.css`
- `src/components/molecules/PredictorList/PredictorList.css`
- `src/components/organisms/NavBar/NavBar.css`
- `src/components/organisms/PWAInstall/PWAInstall.css`

### Project conventions
- `AGENTS.md` — project architecture, conventions, path aliases
- `.planning/ROADMAP.md` — Phase 10 entry
- `.planning/STATE.md` — project state

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `<Button>` atom with variant/size/isLoading/href support — will replace all native buttons
- `<Icon>` atom wrapping pixelarticons — import new icons (Moon, PenSquare, Trash, ChevronLeft, RobotFace)
- `useLiveData` hook — provides loading/error states that Live* components currently ignore
- `fetchAllMatches()` — already exists as dead code in live-data-service.ts, unused
- `fetchLiveStandings()` — already exists, fetches full standings

### Established Patterns
- `client:load` on all Live* components for immediate hydration
- Pixel-art aesthetic via CSS variables in `global.css`
- Component CSS files co-located with components
- Import ordering: built-in → external → internal → relative → side-effect (Phase 9)

### Integration Points
- LiveMatchList used in: `[lang]/index.astro` (home) and `TournamentPage.astro`
- LiveStandings used in: `TournamentPage.astro`
- LiveRankings used in: `RankingsPage.astro`
- ProductTour used in: `PredictionsTemplate.tsx` (2 instances: wizard + first-predictor)
- Button already imported in 18 files — 6 more files need the import

</code_context>

<specifics>
## Specific Ideas

- Home page should show today's live/upcoming matches + next upcoming matches up to 6 total (fetchLiveMatches OR logic — already correct)
- Tournament page should display ALL matches with live updated results (showAll prop → fetchAllMatches)
- No emojis in buttons — use pixelarticons exclusively
- Skeleton components should match retro pixel-art theme (4px borders, sharp corners, blocky shadows)
- The `pix pix-edit` / `pix pix-trash` CSS classes in PredictorList reference undefined styles — remove entirely when replacing with pixelarticons

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-Fix data display issues, unify native buttons with design system Button, fix tour button*
*Context gathered: 2026-05-27*
