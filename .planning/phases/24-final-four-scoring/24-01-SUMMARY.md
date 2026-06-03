---
phase: "24"
plan: "01"
subsystem: scoring
tags: [firebase-functions, firestore, scoring, cloud-functions]

# Dependency graph
requires:
  - phase: "23"
    provides: Group classification scoring with FieldValue.increment stats pattern
provides:
  - Cloud Function deriveFinalStandings (triggers on match writes, slug 'final'/'third-place')
  - Cloud Function calculateFinalFourResults (triggers on final_standings/final writes)
  - Pure function scoreFinalFourBet (exported for unit testing)
  - FinalPhaseBet type extended with firstScoredAt/secondScoredAt/thirdScoredAt/fourthScoredAt
affects:
  - Phase 25 (best players scoring — depends on scoring constants pattern)
  - Phase 26 (badge activation — uses FieldValue.increment stats pattern)

# Tech tracking
tech-stack:
  added:
    - functions/src/deriveFinalStandings.ts
    - functions/src/calculateFinalFourResults.ts
    - functions/src/__tests__/calculateFinalFourResults.test.ts
  patterns:
    - Incremental per-position scoring with scoredAt timestamps (prevents double-scoring)
    - Pure scoring function + trigger handler pattern
    - slug-based match filtering before processing

key-files:
  created:
    - functions/src/deriveFinalStandings.ts — Derives 1st/2nd/3rd/4th from match results
    - functions/src/calculateFinalFourResults.ts — Scores final four bets incrementally
    - functions/src/__tests__/calculateFinalFourResults.test.ts — 8 test cases
  modified:
    - functions/src/index.ts — Added deriveFinalStandings and calculateFinalFourResults exports
    - src/types/firestore.ts — FinalPhaseBet interface extended with scoredAt fields

key-decisions:
  - "Used onWrite trigger on match docs for deriveFinalStandings (vs query-based)"
  - "Used slug filter to only process final/third-place matches"
  - "Per-position scoredAt timestamps prevent double-scoring individual positions"

patterns-established:
  - "Pure scoring function pattern: exported for testing, handles business logic"
  - "Trigger handler pattern: guard → extract data → batch write → stats update"
  - "Incremental write pattern: set({ merge: true }) for partial document updates"

requirements-completed:
  - "SCORE-02"
  - "SCORE-02"

# Metrics
duration: 14 min
started: "2026-06-03T10:26:54Z"
completed: "2026-06-03T10:40:45Z"
---

# Phase 24 Plan 01: Final Four Scoring Summary

**deriveFinalStandings + calculateFinalFourResults CFs with per-position incremental scoring using scoredAt timestamps, SCORING.FINAL_FOUR constants (5pts exact / 3pts qualified)**

## Performance

- **Duration:** 14 min
- **Started:** 2026-06-03T10:26:54Z
- **Completed:** 2026-06-03T10:40:45Z
- **Tasks:** 5/5
- **Files created/modified:** 6 (2 new, 2 modified, 2 committed new)

## Accomplishments
- Cloud Function `deriveFinalStandings`: triggers on match writes with slug 'final' or 'third-place', queries for other match, writes final_standings/final incrementally with {first, second, third, fourth, tournamentId}
- Cloud Function `calculateFinalFourResults`: triggers on final_standings/final writes, scores bets incrementally with per-position scoredAt timestamps, updates predictor stats via FieldValue.increment
- Pure function `scoreFinalFourBet` exported for unit testing: 5 pts exact position, 3 pts qualified wrong position, 0 pts not in final four
- FinalPhaseBet interface extended with firstScoredAt/secondScoredAt/thirdScoredAt/fourthScoredAt optional Timestamp fields
- 8 test cases covering exact positions, qualified wrong position, partial standings, edge cases

## Task Commits

Each task was committed atomically:

1. **Task 1: deriveFinalStandings CF** - `8f0ee1b` (feat)
2. **Task 2: calculateFinalFourResults CF + scoreFinalFourBet** - `9b376c6` (feat)
3. **Task 3: Wire exports in index.ts** - `481e5a8` (feat)
4. **Task 4: FinalPhaseBet scoredAt fields** - `269f1e8` (feat)
5. **Task 5: Unit tests for scoreFinalFourBet** - `560689b` (test)

**Plan metadata:** committed separately in worktree metadata commit

## Files Created/Modified

- `functions/src/deriveFinalStandings.ts` - Cloud Function deriving final standings from match results
- `functions/src/calculateFinalFourResults.ts` - Cloud Function scoring final four bets with per-position timestamps
- `functions/src/__tests__/calculateFinalFourResults.test.ts` - Unit tests for scoreFinalFourBet (8 cases)
- `functions/src/index.ts` - Added deriveFinalStandings and calculateFinalFourResults exports
- `src/types/firestore.ts` - FinalPhaseBet extended with firstScoredAt/secondScoredAt/thirdScoredAt/fourthScoredAt

## Decisions Made

- Used onWrite trigger on match docs (not query-based) for deriveFinalStandings — aligns with existing calculateGroupResults pattern
- Slug filter ensures only 'final' and 'third-place' matches trigger processing
- Per-position scoredAt timestamps prevent double-scoring even when positions are written incrementally

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Test case expectation mismatch: initial test case "16 pts for 2 exact + 2 qualified" returned 10 pts — bet was {ARG, BRA, FRA, JPN} but FRA/JPN are not in final four (ARG, BRA, MEX, CHI). Corrected test cases to use CHI (in final four) instead of FRA.
- Syntax error in test file: duplicate closing bracket `});` on line 57. Fixed by removing duplicate.
- Unused variable lint errors in calculateFinalFourResults.ts: removed duplicate `result` and `firstResult` calls in first position scoring block.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 24 plan 01 complete — ready for next plan in Phase 24.
Final four scoring engine implemented: deriveFinalStandings writes final standings, calculateFinalFourResults scores bets against those standings. The pattern follows calculateGroupResults exactly (pure function + trigger handler, FieldValue.increment stats, scoredAt guard).

---
*Phase: 24-final-four-scoring*
*Completed: 2026-06-03*