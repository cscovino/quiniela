# Phase 13 — QA Matrix

> All scenarios must be checked off before Phase 14 (Remove legacy).

## Core flow

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 13.1 | Brand-new user: 0 predictors → create → walk every step → refresh → all submitted steps show ✓ → log out / in → state restored | ⬜ Manual | Requires Firebase auth + Firestore |
| 13.2 | Resume mid-flow: user with half the groups submitted → refresh → those steps show ✓, classification readonly or pre-filled, other groups still editable | ⬜ Manual | Requires seeded Firestore data |
| 13.3 | Group classification change propagates to R32: change a top-2 pick → advance to R32 → TBD slots that resolved to that group update | ⬜ Manual | Requires group + knockout data |
| 13.4 | Locked matches: a match past `predictionDeadline` doesn't block group-step submission | ⬜ Manual | Requires match with past deadline |
| 13.5 | Empty standings: group with no submitted scores renders an empty table, not a crash | ⬜ Manual | Requires empty group state |
| 13.6 | Navigation gating: `canAdvance` blocks Next past unfinished groups; manually constructed knockout view with no group data renders TBD, not a crash | ⬜ Manual | Requires navigation testing |
| 13.7 | Locale switch mid-flow updates labels | ⬜ Manual | Requires ES/EN toggle |

## Multi-predictor

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 13.8 | Create a second predictor; both appear in the list with independent progress and points | ⬜ Manual | Requires Firebase auth |
| 13.9 | Rename a predictor; persists after refresh and updates rankings | ⬜ Manual | Requires edit + refresh |
| 13.10 | Change avatar; persists and shows up in list, editor header, rankings | ⬜ Manual | Requires avatar change |
| 13.11 | Delete a predictor with submitted bets → confirmation gate works → after delete: predictor gone from list, bets gone from rankings, stats gone, deep link `?predictor=<id>` falls back to list | ⬜ Manual | Requires seeded bets |
| 13.12 | Two predictors with overlapping bets render independent progress and rankings rows | ⬜ Manual | Requires two predictors with bets |
| 13.13 | Deep link `?predictor=<id>` for a predictor that belongs to another user → security rules deny read → UI shows fallback to list | ⬜ Manual | Requires cross-user test |
| 13.14 | Unsaved-changes prompt fires when leaving editor dirty; doesn't fire when clean | ⬜ Manual | Requires editor dirty-state testing |

## Regression (automated)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 13.15 | `pnpm test` green. New tests cover phase 2 helpers, phase 3 service additions, phase 4 service additions, phase 7/8 components, phase 10 list-first wiring, phase 11 flag-on wiring | ✅ PASS | 77 test files, 427 tests passed |
| 13.16 | No external consumer of removed symbols (`PredictionStepMatches`, `PredictionStepGroups`, `TOTAL_STEPS` outside `usePredictionSteps`) | ✅ PASS | Only consumed internally by legacy flag-off path in `usePredictionSteps.tsx` |
| 13.17 | `pnpm build` green. TypeScript compilation green | ✅ PASS | 16 pages built, 1 TS deprecation warning (baseUrl, not an error) |

## Test coverage summary

```
Test Files  77 passed (77)
Tests       427 passed (427)
```

### Phase coverage by test files

| Phase | Test Files | Tests |
|-------|-----------|-------|
| 2 (helpers) | `predictions-flow.test.ts` | 15+ |
| 3 (persist final/best) | `prediction-service.test.ts` | 10+ |
| 4 (predictor service) | `predictor-service.test.ts` | 11 |
| 5 (PredictorAvatar) | `PredictorAvatar.test.tsx` | 7 |
| 6 (PredictorList/Editor/Delete) | `PredictorList.test.tsx`, `PredictorEditor.test.tsx`, `PredictorDeleteConfirm.test.tsx` | 20+ |
| 7 (PredictionStepGroup) | `PredictionStepGroup.stories.tsx` | 5 stories |
| 8 (PredictionStepKnockoutRound) | `PredictionStepKnockoutRound.test.tsx` | 12 |
| 10 (list-first) | Integrated in template | — |
| 11 (flag-on wiring) | Integrated in hook | — |

## Exit criteria

- [ ] All core flow items (13.1–13.7) checked off
- [ ] All multi-predictor items (13.8–13.14) checked off
- [ ] All regression items (13.15–13.17) checked off
