# Phase 10: Fix data display issues, unify native buttons with design system Button, fix tour button - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 10-Fix data display issues, unify native buttons with design system Button, fix tour button
**Areas discussed:** Tournament matches display, Home upcoming matches, Tab buttons, Cache key collision, Tour component, Button scope, LiveStandings, NavBar buttons, Error/Loading states, Today match filter, Home SSR vs fetch, Button variants, Skeleton components, CSS cleanup, Tour icon, Match filter logic, LoginForm buttons, Home match count, Icon additions, Notification/back buttons

---

## Tournament matches display

| Option | Description | Selected |
|--------|-------------|----------|
| showAll prop | Add boolean prop to LiveMatchList — minimal change, reuses fetchAllMatches() | ✓ |
| Separate TournamentMatchList | New component — more code | |
| Pass limit=48 | Simple but doesn't fix logic mismatch | |

**User's choice:** showAll prop if simple enough; otherwise separate component
**Notes:** Tournament page needs all matches with updated results. Home page needs next 6 sorted by date.

---

## Home upcoming matches

| Option | Description | Selected |
|--------|-------------|----------|
| Fix build-data filter | Fix toMatchView() in build-data.ts for correct sorting | |
| Rely on live fetch only | Don't rely on build-time data; let fetchLiveMatches handle it | ✓ |
| Both: filter + live fallback | Dual safety | |

**User's choice:** Rely on live fetch only to avoid this type of bug
**Notes:** Filter should include today's matches. Home page: limit=6.

---

## Tab buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as native buttons | Tab pattern needs role="tab", keep native | ✓ |
| Use Button component | Inconsistent with tab role pattern | |

**User's choice:** Keep native for tabs, but other buttons should use Button component.

---

## Cache key collision

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, fix now | Pass unique cacheKeys from Astro pages | ✓ |
| Not urgent | Minor issue | |

**User's choice:** Fix now

---

## Tour component

| Option | Description | Selected |
|--------|-------------|----------|
| Add autoStart={true} | Simple fix, already has useEffect | ✓ |
| Imperative ref API | More flexible but overkill | |

**User's choice:** Add autoStart={true} to both instances
**Notes:** First-predictor auto-tour has same bug — fix both.

---

## Button scope

| Option | Description | Selected |
|--------|-------------|----------|
| All non-tab buttons | ~15 buttons across 6 components | ✓ |
| Just prediction-related | PredictionsTemplate + PredictorList only | |
| All including NavBar | Full unification | |

**User's choice:** All non-tab buttons

---

## LiveStandings

| Option | Description | Selected |
|--------|-------------|----------|
| Fix cacheKey | Simple parallel fix | ✓ |
| No changes | Already fetches all data | |

**User's choice:** Fix cacheKey

---

## NavBar buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Use Button + ghost variant | Consistent, Button supports children/icons | ✓ |
| Leave as native | Avoid overcomplicating | |

**User's choice:** Use Button + ghost variant

---

## Error/Loading states

| Option | Description | Selected |
|--------|-------------|----------|
| Simple error/loading | Minimal message | |
| Skeleton loading states | Pixel-art styled skeletons | ✓ |
| Not needed now | Skip | |

**User's choice:** Skeleton loading states
**Notes:** Separate skeleton components (SkeletonMatchCard, SkeletonStandings, SkeletonRankings) in @molecules/.

---

## Today match filter

| Option | Description | Selected |
|--------|-------------|----------|
| Include today's matches | Already implemented as OR logic | ✓ |
| Future only | Stricter cut | |

**User's choice:** Include today's matches

---

## Home SSR vs fetch

| Option | Description | Selected |
|--------|-------------|----------|
| SSR + live refresh | Pass initial data for SSR, then live-fetch on hydration | ✓ |
| Client fetch only | No build-time data | |

**User's choice:** SSR + live refresh

---

## Button variants

| Option | Description | Selected |
|--------|-------------|----------|
| Specific palette | Variant per button type | ✓ |
| Keep existing styles | Just replace markup | |

**User's choice:** Specific palette
**Notes:** Back/dismiss → ghost, Login/submit/install → primary, Delete → danger, Tour → accent, Edit → secondary, New prediction → primary, NavBar hamburger/logout/notifications/theme → ghost.

---

## CSS cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Clean up old CSS | Remove old button CSS after replacement | ✓ |
| Keep old CSS | Leave unused CSS | |

**User's choice:** Clean up all old button CSS

---

## Tour icon (no emoji)

| Option | Description | Selected |
|--------|-------------|----------|
| RobotFace | Friendly guide icon | ✓ |
| WarningDiamond | Alert-like | |
| Gamepad | Retro gaming | |

**User's choice:** RobotFace with accent variant, no emoji

---

## Match filter logic

| Option | Description | Selected |
|--------|-------------|----------|
| Combine today + upcoming | Next 6 regardless of mix | |
| Keep OR logic | Today matches OR upcoming | ✓ |

**User's choice:** Keep OR logic

---

## LoginForm buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Replace with Button | Ghost variant | |
| Leave as native | Toggle links, not action buttons | ✓ |

**User's choice:** Leave as native

---

## Home page match count

| Option | Description | Selected |
|--------|-------------|----------|
| 6 matches | User mentioned "next 6" | ✓ |
| 5 matches | Keep current default | |
| 8 matches | Slightly more | |

**User's choice:** 6

---

## Icon additions

| Option | Description | Selected |
|--------|-------------|----------|
| Moon, PenSquare, Trash, Login, Logout, Sparkles, RobotFace, ChevronLeft, Bell | Full set | ✓ |
| Different icons | User would specify | |

**User's choice:** Add all: Moon (theme toggle dark), Sparkles (theme toggle light), PenSquare (edit), Trash (delete), ChevonLeft (back), RobotFace (tour). Login/Logout/Bell already exist.

---

## Notification/back buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Unify everything | Notifications bell → Button, back buttons → arrow icons | ✓ |
| Just what we discussed | Previous list only | |

**User's choice:** Unify everything — notifications bell, all back buttons, all icons in scope.

---

*Phase: 10-Fix data display issues, unify native buttons with design system Button, fix tour button*
*Discussion gathered: 2026-05-27*
