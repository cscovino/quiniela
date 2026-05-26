---
phase: 01-refactor-design-system-to-use-rem-units-for-font-size-and-ot
plan: 07
subsystem: pwa
tags: [service-worker, beforeinstallprompt, cache, pwa, localStorage]

# Dependency graph
requires:
  - phase: 01-01
    provides: PWA manifest id field for Chrome 121+ compatibility
provides:
  - Visible PWA install prompt with beforeinstallprompt handling
  - Service worker cache version bump (v4 → v5)
  - SKIP_WAITING message handler for forced updates
affects: [PWA installation flow, cache invalidation on deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - beforeinstallprompt event capture with ref storage
    - localStorage for install dismissal persistence
    - SKIP_WAITING message handler for external service worker updates

key-files:
  created:
    - src/components/organisms/PWAInstall/PWAInstall.tsx
    - src/components/organisms/PWAInstall/PWAInstall.css
  modified:
    - public/sw.js
    - src/layouts/BaseLayout.astro

key-decisions:
  - "Used fixed positioning bottom-right for desktop, full-width bar on mobile"
  - "Dismissal stored in localStorage to avoid showing again"
  - "Gold background for install prompt to match tournament branding"
  - "SKIP_WAITING already called in install event, added message handler for external triggers"

patterns-established:
  - "PWA install: beforeinstallprompt → preventDefault → store in ref → prompt() on user action"
  - "Service worker versioning: bump CACHE_NAME on each deploy to invalidate old caches"

requirements-completed:
  - REQ-15
  - REQ-18

# Metrics
duration: 10min
completed: 2026-05-26T16:46:00Z
---

# Phase 01-07: PWA Install & Cache Busting Summary

**Added visible PWA install prompt and bumped service worker cache version**

## Performance

- **Duration:** 10 min
- **Started:** 2026-05-26T16:36:00Z
- **Completed:** 2026-05-26T16:46:00Z
- **Tasks:** 2/2 complete
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Created PWAInstall component with beforeinstallprompt event handling
- Added dismiss button with localStorage persistence
- Bumped service worker cache from v4 to v5
- Added SKIP_WAITING message handler for forced updates
- Integrated into BaseLayout.astro with client:load

## Task Commits

Each task committed atomically:

1. **Task 2: Cache version bump** - `d0feafe` (feat)
2. **Task 1: PWAInstall component** - `aa16023` (feat)

**Plan metadata:** `aa16023` (docs: complete plan)

## Files Created/Modified
- `src/components/organisms/PWAInstall/PWAInstall.tsx` - Install prompt component
- `src/components/organisms/PWAInstall/PWAInstall.css` - Pixel-art styled install banner
- `public/sw.js` - CACHE_NAME v5, SKIP_WAITING handler
- `src/layouts/BaseLayout.astro` - Import and render PWAInstall

## Verification

- `grep -q 'beforeinstallprompt' src/components/organisms/PWAInstall/PWAInstall.tsx` returns true
- `grep -q 'pwa-install-dismissed' src/components/organisms/PWAInstall/PWAInstall.tsx` returns true
- `grep -q "CACHE_NAME = 'quiniela-v5'" public/sw.js` returns true
- `grep -q 'SKIP_WAITING' public/sw.js` returns true
- `pnpm build` succeeds (16 pages built)
- `pnpm test:run` passes (428 tests)
