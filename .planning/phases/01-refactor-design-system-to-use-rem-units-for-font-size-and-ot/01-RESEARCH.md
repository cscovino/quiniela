# Phase 1: Frontend UX improvements and responsive design fixes - Research

**Researched:** 2026-05-26
**Domain:** CSS responsive design, PWA, pixel-art UI, Astro 6 + React 19
**Confidence:** HIGH

## Summary

This phase addresses 21 requirements spanning three categories: bug fixes (2), responsive/UX improvements (12), visual enhancements (3), PWA features (2), predictor list UX (2), and documentation (1). The project already has a well-structured CSS design token system in `global.css` with dark/light themes, WC26 brand colors, and a pixel-art aesthetic using Press Start 2P font. Most font sizes are already defined in rem units as CSS variables, but several components use hardcoded `px` values that need migration.

**Primary recommendation:** Treat this as a coordinated design-system sweep — fix the two bugs first (they block UX), then migrate all remaining px font-sizes to rem, then layer on responsive/visual improvements using existing tokens before adding new ones.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Team name responsive display | Browser / Client | — | CSS container queries + conditional rendering in TeamFlag |
| Mobile select dropdown sizing | Browser / Client | — | Native `<select>` styling limitations; CSS + custom dropdown |
| Pixelated button corners | Browser / Client | — | CSS `clip-path` or stepped `box-shadow` technique |
| Progress indicator compact | Browser / Client | — | CSS media queries + existing compact variant |
| Best Players submission bug | Browser / Client | API / Backend | Client-side state management in `usePredictionSteps` hook |
| TeamSelector empty bug | Browser / Client | — | React state + Radio component interaction |
| rem font-size migration | Browser / Client | — | CSS variable system already in place |
| Tournament colors / vibrancy | Browser / Client | — | Existing CSS tokens + gradients |
| Mobile menu overlay | Browser / Client | — | CSS backdrop + z-index layering |
| PWA install prompt | Browser / Client | — | `beforeinstallprompt` event API |
| PWA cache-busting | Browser / Client | CDN / Static | Service worker cache versioning |
| Horizontal scroll elimination | Browser / Client | — | CSS `overflow-x: hidden` + component width audits |
| Spinner pixel-art redesign | Browser / Client | — | CSS animation + pixel-art frames |
| Predictor list UX | Browser / Client | — | Component interaction design |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 6.3.7 | Static site framework | Project standard, SSG with React islands |
| React | 19.2.6 | UI component library | Project standard for interactive islands |
| Zustand | 5.0.13 | State management | Project standard (auth store, toast store) |
| Firebase | 12.13.0 | Backend services | Project standard (Auth, Firestore, Functions) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| flag-icons | 7.5.0 | Country flag CSS classes | Already used in TeamFlag component |
| pixelarticons | 2.1.1 | Pixel-art icon font | Already in dependencies, underutilized |
| Vitest | 4.1.7 | Test framework | Project standard for unit tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<select>` for team dropdown | Custom dropdown with React state | More control over styling, but adds complexity |
| CSS `clip-path` for pixel corners | Stepped `box-shadow` or SVG mask | clip-path is cleaner but less IE support (not relevant here) |
| `beforeinstallprompt` event | No custom prompt (browser default) | Less user-visible install UX |

**Installation:**
No new packages needed. All required capabilities can be built with existing dependencies. The phase is primarily CSS refactoring, bug fixes, and new components using the existing stack.

**Version verification:**
```bash
npm view astro version        # 6.3.7 (current)
npm view react version        # 19.2.6 (current)
npm view zustand version      # 5.0.13 (current)
npm view firebase version     # 12.13.0 (current)
npm view vitest version       # 4.1.7 (current)
```

## Package Legitimacy Audit

No new packages to install. All work uses existing dependencies.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| astro | npm | 4 yrs | 2M+/wk | github.com/withastro/astro | N/A | Existing |
| react | npm | 12 yrs | 20M+/wk | github.com/facebook/react | N/A | Existing |
| zustand | npm | 5 yrs | 5M+/wk | github.com/pmndrs/zustand | N/A | Existing |
| firebase | npm | 8 yrs | 3M+/wk | github.com/firebase/firebase-js-sdk | N/A | Existing |
| flag-icons | npm | 3 yrs | 500K+/wk | github.com/lipis/flag-icons | N/A | Existing |
| pixelarticons | npm | 3 yrs | 1K+/wk | github.com/halfmage/pixelarticons | N/A | Existing |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client Tier)                                       │
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ Astro    │───▶│ React Islands│───▶│ Zustand Stores    │  │
│  │ Pages    │    │ (Interactive)│    │ (auth, toast)     │  │
│  │ (SSG)    │    │              │    │                   │  │
│  └──────────┘    └──────┬───────┘    └────────┬──────────┘  │
│                         │                     │              │
│  ┌──────────────────────┴─────────────────────┴──────────┐  │
│  │  Component Layer (Atomic Design)                       │  │
│  │  @atoms → @molecules → @organisms → @templates        │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┴────────────────────────────────┐  │
│  │  CSS Design Tokens (global.css)                        │  │
│  │  Colors, Typography, Spacing, Borders, Shadows, Anim   │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch()
┌──────────────────────────┴──────────────────────────────────┐
│  Firebase (Backend Tier)                                     │
│  Auth │ Firestore │ Cloud Functions │ Cloud Messaging        │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

No structural changes needed. The existing Atomic Design pattern (`@atoms/`, `@molecules/`, `@organisms/`, `@templates/`) is well-suited for this phase. New components should follow the same pattern:

- **New PWAInstall component:** `@organisms/PWAInstall/` (already in vitest exclude list, suggesting it was planned)
- **Pixel-art spinner redesign:** Modify existing `@atoms/Spinner/`
- **Mobile menu overlay:** Modify existing `@organisms/NavBar/`

### Pattern 1: CSS Container Queries for Responsive Team Names

**What:** Use CSS container queries to show full team name when container is wide enough, fall back to FIFA code when narrow.

**When to use:** When the same component needs different content based on its container width, not viewport width.

**Example:**
```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries */
.team-flag {
  container-type: inline-size;
  container-name: teamflag;
}

.team-flag__name {
  display: none;
}

.team-flag__fifa-code {
  display: inline;
}

@container teamflag (min-width: 120px) {
  .team-flag__name {
    display: inline;
  }
  .team-flag__fifa-code {
    display: none;
  }
}
```

### Pattern 2: Pixel-Art Stepped Corners via clip-path

**What:** Use CSS `clip-path` with `polygon()` to create stepped/pixelated corners instead of smooth `border-radius`.

**When to use:** For pixel-art aesthetic buttons and cards that need "rounded" corners with blocky steps.

**Example:**
```css
/* 4px stepped corner (2 steps of 4px each) */
.btn--pixel-rounded {
  clip-path: polygon(
    0px 8px, 4px 8px, 4px 4px, 8px 4px, 8px 0px,
    calc(100% - 8px) 0px, calc(100% - 8px) 4px,
    calc(100% - 4px) 4px, calc(100% - 4px) 8px,
    100% 8px, 100% calc(100% - 8px),
    calc(100% - 4px) calc(100% - 8px),
    calc(100% - 4px) calc(100% - 4px),
    calc(100% - 8px) calc(100% - 4px),
    calc(100% - 8px) 100%,
    8px 100%, 8px calc(100% - 4px),
    4px calc(100% - 4px), 4px calc(100% - 8px),
    0px calc(100% - 8px)
  );
}
```

### Pattern 3: PWA beforeinstallprompt Event

**What:** Capture the `beforeinstallprompt` event to show a custom install button.

**When to use:** When you want a visible install prompt instead of relying on browser-chrome install UI.

**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
let installPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event as BeforeInstallPromptEvent;
  // Show install button in UI
});

async function triggerInstall() {
  if (!installPrompt) return;
  const result = await installPrompt.prompt();
  if (result.outcome === 'accepted') {
    // Hide install button
  }
  installPrompt = null;
}
```

### Pattern 4: Service Worker Cache Busting

**What:** Increment `CACHE_NAME` version in `sw.js` to force cache invalidation on deploy.

**When to use:** Every deployment to ensure users get fresh assets.

**Current implementation:** `sw.js` already has `CACHE_NAME = 'quiniela-v4'` with proper install/activate lifecycle that deletes old caches. The pattern is correct — just needs version bumping on each deploy.

**Recommendation:** Add a build-time version injection or manual version bump checklist.

### Anti-Patterns to Avoid

- **`!important` overrides:** The codebase has a few `!important` declarations (e.g., `text-align: left !important` in PredictionsTemplate.css). Avoid adding more — fix specificity at the source.
- **Inline styles for responsive behavior:** Use CSS variables and media queries, not inline style manipulation.
- **Hardcoded px values in new CSS:** All new font-sizes must use `rem` with CSS variable references.
- **Native `<select>` styling on iOS:** iOS Safari severely limits `<select>` styling. For the TeamSelector, consider a custom dropdown on mobile.
- **`overflow: hidden` on body as scroll fix:** The codebase already has `overflow-x: hidden` on `html, body`. The horizontal scroll issue is likely caused by individual components exceeding viewport width (e.g., tables, grids with fixed min-widths).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PWA install detection | Custom heuristics | `beforeinstallprompt` event | Browser-native, handles all edge cases |
| Cache versioning | Manual file hash checking | `CACHE_NAME` increment + `clients.claim()` | Service worker already handles this correctly |
| Pixel-art corners | Custom SVG per component | CSS `clip-path` polygon | Single CSS class, reusable, no assets |
| Team flag responsive display | JS resize listeners | CSS container queries | No JS overhead, declarative |
| Loading spinner animation | GIF/Lottie | CSS `steps()` animation | Already using `steps(8)`, just needs visual redesign |
| Mobile menu backdrop | Custom overlay component | CSS `::before` pseudo-element + `position: fixed` | Zero JS, uses existing z-index tokens |

**Key insight:** The project already has excellent CSS infrastructure (design tokens, animations, z-index scale). Most improvements are about applying existing patterns consistently, not building new systems.

## Runtime State Inventory

> This is a greenfield phase (not rename/refactor/migration). No runtime state inventory needed.

**Nothing found in category:** Phase does not involve rename, rebrand, or migration operations.

## Common Pitfalls

### Pitfall 1: iOS Safari `<select>` Styling Limitations
**What goes wrong:** Custom styling on `<select>` elements is ignored or partially applied on iOS Safari.
**Why it happens:** iOS uses native picker UI for `<select>` elements, overriding most CSS.
**How to avoid:** For the TeamSelector (Req 6), use a custom dropdown built with `<div>`/`<button>` elements and React state, not a native `<select>`. The current TeamSelector uses Radio buttons, not select — but the PredictionStepGroup uses native `<select>` for position ranking (line 315-329 of PredictionStepGroup.tsx), which will have this issue on mobile.
**Warning signs:** Select dropdowns look correct in Chrome DevTools mobile emulation but broken on real iOS devices.

### Pitfall 2: CSS Container Queries Browser Support
**What goes wrong:** Container queries don't work in older browsers.
**Why it happens:** Container queries require Chrome 105+, Firefox 110+, Safari 16+.
**How to avoid:** Provide a viewport-based media query fallback for the team name display. The project's minimum browser support isn't specified, but given the PWA target, assume modern browsers.
**Warning signs:** Team names always show FIFA code or always show full name regardless of container width.

### Pitfall 3: `beforeinstallprompt` Not Firing
**What goes wrong:** Install button never appears because the event never fires.
**Why it happens:** Chrome requires: (1) valid manifest.json, (2) registered service worker, (3) HTTPS, (4) user hasn't already installed/dismissed. The current manifest.json is missing an `id` field (recommended for Chrome 121+).
**How to avoid:** Add `"id": "/"` to manifest.json. Test with Chrome DevTools Application > Manifest > "Installability" check.
**Warning signs:** `beforeinstallprompt` listener never triggers, even on HTTPS with valid manifest.

### Pitfall 4: `clip-path` Removes Box Shadows
**What goes wrong:** Applying `clip-path` to a button removes its `box-shadow`.
**Why it happens:** `clip-path` clips the entire rendering box, including shadows.
**How to avoid:** Use a wrapper element with the shadow and apply `clip-path` to the inner element, or use `filter: drop-shadow()` which works with clip-path.
**Warning signs:** Buttons lose their pixel-art shadow when pixel-rounded corners are applied.

### Pitfall 5: rem Migration Breaks Press Start 2P Readability
**What goes wrong:** Converting all px values to rem makes pixel font too small or too large.
**Why it happens:** Press Start 2P is a bitmap-style font that looks best at specific pixel sizes. rem values depend on root font-size.
**How to avoid:** Keep the existing rem scale (`--text-xs: 0.625rem` = 10px, etc.) which is already well-tuned. Only migrate hardcoded px values that aren't using variables.
**Warning signs:** Text looks blurry or misaligned after rem conversion.

### Pitfall 6: Best Players Step Index Off-by-One
**What goes wrong:** The "Best Players" step is incorrectly marked as submitted after completing Group A.
**Why it happens:** Looking at `usePredictionSteps.tsx`, the `submittedSteps` state is a `Set<number>` indexed by step position. The group steps are added first (12 groups = indices 0-11), then knockout rounds, then final phase, then best players. The bug is likely that the step index calculation in `handleGroupStepSubmit` (line 300: `setSubmittedSteps((prev) => new Set(prev).add(stepIndex))`) is using the wrong `stepIndex` variable, or the `isComplete` check on line 476 (`submittedSteps.has(stepIndex) || existingBestPlayers != null`) is matching an incorrect index. **Root cause analysis:** The `stepIndex` variable in the `useMemo` that builds steps is a local counter. When `handleGroupStepSubmit` is called with `stepIndex`, it's the index at the time the step was created. However, if `submittedSteps` contains index 2 (from a group submission), and the best players step is at index 19 (12 groups + 6 knockout + 1 final = 19), there shouldn't be a collision. **More likely cause:** The `isComplete` property on line 476 checks `submittedSteps.has(stepIndex)`. If a previous submission accidentally added the wrong index to `submittedSteps`, it would mark the wrong step as complete. Need to trace the exact index values during the Group A submission flow.
**How to avoid:** Add console logging of step indices during submission to identify the off-by-one. Likely fix: ensure `stepIndex` is correctly passed through the submission chain.
**Warning signs:** After submitting Group A, the progress indicator shows Best Players as checked.

### Pitfall 7: TeamSelector Shows Empty After Selection
**What goes wrong:** After selecting a team in TeamSelector, the UI shows no selection.
**Why it happens:** Looking at `TeamSelector.tsx` (line 42-48), the Radio component uses `name="team-selector"` as a hardcoded string for ALL instances. When multiple TeamSelector components exist on the same page (e.g., in knockout predictions), they share the same radio group name, causing selections to interfere. **Root cause:** The `name` prop on the Radio input should be unique per TeamSelector instance (e.g., using `useId()` or a passed-in name prop).
**How to avoid:** Pass a unique `name` prop to each TeamSelector instance, or use the Radio component's `id` generation properly.
**Warning signs:** Selecting a team in one match clears the selection in another match.

## Code Examples

### rem Font-Size Migration Pattern

```css
/* BEFORE (hardcoded px) */
.team-flag__name {
  font-size: 9px;
}

/* AFTER (using existing CSS variable) */
.team-flag__name {
  font-size: var(--text-xs); /* 0.625rem = 10px, close enough */
}
```

All hardcoded `px` font-size values found in the codebase:
- `TeamFlag.css:33` — `font-size: 9px` (team name)
- `TeamFlag.css:56` — `font-size: var(--text-xs)` (already rem, OK)
- `PredictionsTemplate.css:122` — `font-size: 8px` (compact progress label)
- `PredictionsTemplate.css:162` — `font-size: 9px` (progress label)
- `PredictionsTemplate.css:248` — `font-size: 9px` (team cell)
- `NavBar.css:144` — `font-size: 8px` (notification badge)

### Mobile Menu Backdrop Overlay

```css
/* Add to NavBar.css */
.nav-bar__mobile-menu::before {
  content: '';
  position: fixed;
  inset: 0;
  top: 100%; /* Start below nav bar */
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: calc(var(--z-overlay) - 1);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.nav-bar__mobile-menu.open::before {
  opacity: 1;
}
```

### Pixel-Art Spinner Redesign

```css
/* Replace current spinning border with pixel-art animation */
.spinner {
  border: none;
  background: transparent;
}

.spinner::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: var(--color-accent-500);
  animation: pixel-spin-frames 0.8s steps(8) infinite;
  clip-path: polygon(
    50% 0%, 60% 0%, 60% 10%, 70% 10%, 70% 20%,
    80% 20%, 80% 30%, 90% 30%, 90% 40%, 100% 40%,
    100% 60%, 90% 60%, 90% 70%, 80% 70%, 80% 80%,
    70% 80%, 70% 90%, 60% 90%, 60% 100%, 40% 100%,
    40% 90%, 30% 90%, 30% 80%, 20% 80%, 20% 70%,
    10% 70%, 10% 60%, 0% 60%, 0% 40%, 10% 40%,
    10% 30%, 20% 30%, 20% 20%, 30% 20%, 30% 10%,
    40% 10%, 40% 0%
  );
}

@keyframes pixel-spin-frames {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Horizontal Scroll Prevention

```css
/* Add to global.css base styles */
img, video, canvas, svg {
  max-width: 100%;
  height: auto;
}

table {
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Audit all grid min-width values */
/* prediction-form__grid uses minmax(340px, 1fr) — may cause overflow on <340px screens */
@media (max-width: 340px) {
  .prediction-form__grid {
    grid-template-columns: 1fr;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `px` font-sizes | `rem` with CSS variables | WCAG 2.2 requirement | Respects user browser font preferences |
| Viewport media queries | Container queries | 2022-2023 | Components respond to their container, not viewport |
| Browser install prompt | `beforeinstallprompt` custom UI | 2019+ | Better UX, visible install button |
| Service worker cache busting | Version-based cache names | Standard PWA pattern | Already implemented correctly |
| `border-radius` for corners | `clip-path` for pixel corners | Pixel-art aesthetic | Maintains sharp aesthetic |

**Deprecated/outdated:**
- `font-size` in `px`: WCAG 2.2 requires scalable text. All font-sizes should use `rem`.
- `!important` in CSS: Breaks cascade predictability. Fix specificity instead.
- Hardcoded `name` on radio groups: Causes cross-component interference. Use dynamic names.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | TeamSelector bug is caused by shared `name="team-selector"` on Radio inputs | Common Pitfalls #7 | Medium — if wrong, the actual bug may be in state management instead |
| A2 | Best Players bug is an off-by-one in step index tracking | Common Pitfalls #6 | Medium — may require deeper investigation into the prediction flow |
| A3 | Container queries are acceptable (modern browser target) | Architecture Patterns | Low — can fall back to media queries if needed |
| A4 | No new npm packages needed for this phase | Standard Stack | Low — all capabilities achievable with existing deps |
| A5 | Press Start 2P font renders acceptably at 10px (0.625rem) | Common Pitfalls #5 | Medium — may need custom rem scale for pixel font |

## Open Questions

1. **What is the minimum viewport width to support?**
   - What we know: CSS has `--breakpoint-sm: 480px` and `--breakpoint-md: 1024px`
   - What's unclear: Should we support screens below 320px (iPhone SE first gen)?
   - Recommendation: Assume 320px minimum. The `prediction-form__grid` with `minmax(340px, 1fr)` will overflow at 320px.

2. **Should the PWA install prompt be shown on every visit or only once?**
   - What we know: `beforeinstallprompt` can only be triggered once per event capture
   - What's unclear: Should we store "install dismissed" state in localStorage?
   - Recommendation: Show install button until user installs or explicitly dismisses. Store dismissal in localStorage.

3. **What tournament name should be displayed prominently (Req 9)?**
   - What we know: The brand label in NavBar is configurable via `translations.brandLabel`
   - What's unclear: Should this be "FIFA World Cup 2026" or "Quiniela WC26" or something else?
   - Recommendation: Use "FIFA World Cup 2026" as the primary tournament name, displayed in the page header or as a hero section.

4. **Should the pixel-art spinner use CSS-only or SVG frames?**
   - What we know: Current spinner is CSS-only with `steps(8)` animation
   - What's unclear: Would a pixel-art loading animation (e.g., a spinning football) be better?
   - Recommendation: CSS-only with `clip-path` for a pixelated circle/spinner shape. Keeps it dependency-free.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev | ✓ | v22.x (required >=22.12.0) | — |
| pnpm | Package manager | ✓ | 10.33.4 | — |
| Astro | Dev server/build | ✓ | 6.3.7 | — |
| Firebase CLI | Deploy | ✗ | — | Manual Firebase console deploy |
| Chrome/Chromium | PWA testing | ✓ | — | Firefox (limited PWA support) |

**Missing dependencies with fallback:**
- Firebase CLI — not verified on this machine. Needed for `pnpm deploy:app` and `pnpm firebase:hosting`. Fallback: deploy via Firebase console.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 with jsdom environment |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm test:run` (single project) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-1 | Team names show full name when space allows | unit | `pnpm test:run -- -t "TeamFlag"` | ❌ Wave 0 |
| REQ-2 | Mobile select dropdowns properly sized | unit | `pnpm test:run -- -t "TeamSelector"` | ❌ Wave 0 |
| REQ-3 | Back/Next buttons have pixelated corners | visual | Storybook snapshot | ❌ Wave 0 |
| REQ-4 | Progress indicator compact on mobile | unit | `pnpm test:run -- -t "PredictionsProgress"` | ❌ Wave 0 |
| REQ-5 | Best Players not marked submitted after Group A | unit | `pnpm test:run -- -t "usePredictionSteps"` | ❌ Wave 0 |
| REQ-6 | TeamSelector shows selected team | unit | `pnpm test:run -- -t "TeamSelector"` | ❌ Wave 0 |
| REQ-7 | Font sizes use rem units | lint/style | `pnpm lint` + CSS audit | ❌ Wave 0 |
| REQ-10 | Mobile menu has backdrop overlay | unit | `pnpm test:run -- -t "NavBar"` | ❌ Wave 0 |
| REQ-15 | PWA install prompt visible | unit | `pnpm test:run -- -t "PWAInstall"` | ❌ Wave 0 |
| REQ-17 | No horizontal scrolling | visual | Manual + Playwright | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test:run`
- **Per wave merge:** `pnpm lint && pnpm test:run && pnpm build`
- **Phase-gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] Tests for TeamFlag responsive behavior
- [ ] Tests for TeamSelector selection state
- [ ] Tests for NavBar mobile menu backdrop
- [ ] Tests for usePredictionSteps step index tracking (bug #5)
- [ ] Tests for PWAInstall component (new)
- [ ] CSS audit script to find remaining px font-sizes

## Security Domain

> Security enforcement is not explicitly disabled in config, so this section is included.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth changes in this phase |
| V3 Session Management | no | No session changes |
| V4 Access Control | no | No access control changes |
| V5 Input Validation | no | No new input surfaces |
| V6 Cryptography | no | No crypto changes |
| V7 Client-Side | yes | CSP already in BaseLayout; PWA install prompt doesn't affect security |
| V14 Configuration | yes | Service worker cache versioning affects asset integrity |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Service worker cache poisoning | Tampering | `CACHE_NAME` versioning + hash verification (already implemented) |
| XSS via user displayName in mobile menu | Spoofing | React auto-escapes; ensure no `dangerouslySetInnerHTML` |
| PWA install prompt phishing | Social | Only show on same-origin, use standard `beforeinstallprompt` API |

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** — All component files read directly from `/Users/cscovino/github/quiniela/src/`
- **MDN: BeforeInstallPromptEvent** — https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
- **web.dev: Add a web app manifest** — https://web.dev/articles/add-manifest
- **npm registry** — Package versions verified via `npm view`

### Secondary (MEDIUM confidence)
- **CSS Container Queries** — MDN documentation (browser support verified)
- **CSS clip-path for pixel art** — Common technique, verified via MDN clip-path docs
- **iOS select styling limitations** — Well-documented WebKit behavior

### Tertiary (LOW confidence)
- **Best Players bug root cause** — Requires runtime debugging to confirm exact index mismatch
- **TeamSelector bug root cause** — Requires runtime debugging to confirm radio name collision

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against package.json and npm registry
- Architecture: HIGH — direct codebase analysis of all relevant files
- Pitfalls: MEDIUM — bug root causes require runtime verification
- CSS patterns: HIGH — verified against MDN and web.dev

**Research date:** 2026-05-26
**Valid until:** 2026-06-26 (30 days — CSS/browser APIs are stable)
