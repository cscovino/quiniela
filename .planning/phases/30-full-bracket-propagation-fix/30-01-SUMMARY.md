---
phase: 30-full-bracket-propagation-fix
plan: 01
subsystem: ui
tags: [react, knockout-bracket, real-time-propagation, prediction-steps]

# Dependency graph
requires:
  - phase: 28-fix-third-place-teams-standings-points-and-r32-to-r16-bracke
    provides: buildKnockoutBracket with winner-of slot resolution
  - phase: 29-third-place-points-fix
    provides: confirmedAdvancingMap, group bets fixture
provides:
  - onPredictionChange callback for real-time bracket streaming
  - livePredictions state mirroring knockoutBetsByMatchSlug
  - handlePredictionStreaming callback for real-time state updates
  - End-to-end propagation test suite for R32→R16→QF→SF→Final chain
affects:
  - knockout prediction wizard
  - usePredictionSteps hook

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Real-time prediction streaming via callback (onPredictionChange)
    - Dual-state mirroring (livePredictions + knockoutBetsByMatchSlug)
    - Clear stale picks on round submission

key-files:
  created:
    - src/utils/__tests__/predictions-flow.test.ts (7 new propagation tests, 162 lines)
  modified:
    - src/components/molecules/Predictions/PredictionStepKnockoutRound.tsx (onPredictionChange prop + callback invocation)
    - src/hooks/usePredictionSteps.tsx (livePredictions state, handlePredictionStreaming, onPredictionChange wiring)

key-decisions:
  - "livePredictions is an internal mirror of knockoutBetsByMatchSlug — does not replace it; both update together on each pick for consistency with Firestore sync on round submit"

patterns-established:
  - "onPredictionChange fires immediately on each winner pick (not on submit), enabling downstream bracket rounds to populate before the user finishes the current round"

requirements-completed: [KOFIX-08]

# Metrics
duration: 12min
completed: 2026-06-04
---

# Phase 30 Plan 01: Full Bracket Propagation Fix Summary

**Real-time bracket propagation via onPredictionChange callback — R32 winners now fill R16, QF, SF, and Final before round submission.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-04T06:10:01Z
- **Completed:** 2026-06-04T06:21:55Z (human verification: 2026-06-04T18:45:00Z)
- **Tasks:** 4 completed (30-01, 30-02, 30-03, 30-04)
- **Files modified:** 3

## Accomplishments

- `PredictionStepKnockoutRound` now calls `onPredictionChange(matchSlug, winner)` on each winner pick — enabling real-time bracket propagation to downstream rounds
- `usePredictionSteps` now maintains `livePredictions` state alongside `knockoutBetsByMatchSlug`; `handlePredictionStreaming` updates both on every pick so `buildKnockoutBracket` recomputes with updated picks before round submission
- `handleKnockoutRoundSubmit` clears `livePredictions` after successful round submission to avoid stale picks
- 7 end-to-end propagation tests verify the full R32→R16→QF→SF→Final chain in `buildKnockoutBracket`
- Human verification confirmed: R16, QF, SF, and Final brackets all populate with actual team names as winners are picked
- 824/824 tests passing (no regressions)

## Task Commits

Each task was committed atomically:

1. **Task 30-01: Add onPredictionChange callback to PredictionStepKnockoutRound** - `8d5a066` (feat)
2. **Task 30-02: Add livePredictions state and streaming handler in usePredictionSteps** - `1083d45` (feat)
3. **Task 30-03: Add end-to-end propagation test for full bracket chain** - `256325a` (feat)
4. **Task 30-04: Manual UI verification — bracket propagation end-to-end** - `41c72af` (test)

**Plan metadata:** (pending summary commit)

## Files Created/Modified

- `src/components/molecules/Predictions/PredictionStepKnockoutRound.tsx` — Added `onPredictionChange?: (matchSlug: string, winnerFifaCode: string) => void` prop; `handlePrediction` now calls it on each pick
- `src/hooks/usePredictionSteps.tsx` — Added `livePredictions` state, `handlePredictionStreaming` callback, wired `onPredictionChange={handlePredictionStreaming}` to `PredictionStepKnockoutRound`, clears `livePredictions` on round submit
- `src/utils/__tests__/predictions-flow.test.ts` — Added `describe('buildKnockoutBracket — full propagation chain R32→R16→QF→SF→Final')` with 7 tests covering: R16 resolves from R32 winners, QF from R16, SF from QF, Final from SF, third-place from SF losers, partial propagation, and group-bets-only R32 resolution

## Human Verification Results (Task 30-04)

Human verification **APPROVED** — bracket propagation confirmed working:

| Checkpoint | Result |
|------------|--------|
| R16 shows actual team names (not TBD) for matches where R32 winners were picked | ✅ PASS |
| QF bracket populates with actual team names when R16 winners are picked | ✅ PASS |
| SF bracket populates with actual team names when QF winners are picked | ✅ PASS |
| Final bracket populates with actual team names when SF winners are picked | ✅ PASS |

## Decisions Made

- Used `livePredictions` as a named mirror of `knockoutBetsByMatchSlug` that updates in real-time on each pick. `knockoutBetsByMatchSlug` is the source of truth for Firestore sync on round submit; both update together on every pick to keep `buildKnockoutBracket` in sync immediately.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript errors in `usePredictionSteps.tsx` (`Date | null` vs `Date | undefined`) were not introduced by this plan and were not fixed (out of scope per deviation rules)
- Commit message length validation required shortening the third commit message from "end-to-end propagation test chain" to "propagation tests for"

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

All 4 tasks in plan 30-01 are complete and verified. Phase 30 is ready for remaining plans.

---
*Phase: 30-full-bracket-propagation-fix*
*Completed: 2026-06-04*