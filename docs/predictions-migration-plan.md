# Predictions Migration Plan — Per-Group Steps + Multi-Predictor Support

> Status: **not started**. Document only. Each phase ships as its own PR.

## Goal

Refactor the predictions flow so each group is its own step (matches + live
standings + classification picker in one screen), followed by per-round
knockout steps that use the user's group classification to resolve TBD slots,
then tournament top-4, then best players. At the same time, surface the
already-existing multi-predictor data model in the UI: list view of all the
user's predictions with create / edit / delete, predictor name + avatar shown
in rankings and profile.

## Decisions captured

- **Predictor limit:** unlimited.
- **Predictor operations:** edit (name), delete (with cascade), avatar (emoji + color).
- **Editor entry point:** always first step; completed steps show ✓.
- **Behavior switch:** flag-gated, single line, easy revert.

## Hard constraints (do not break)

1. Firestore schema additions are **additive only** (new optional fields, new
   collections). No renames, no migrations of existing data.
2. `prediction-service` and `predictor-service` public method signatures only
   **grow**; existing callers keep working.
3. The current flow stays functional at the end of every phase before phase
   11. Behavior change happens once, behind a one-line flag.
4. Each phase ships independently (green tests, green build, green typecheck)
   and is revertable by reverting that phase's PR.

---

## Phase 1 — Baseline & safety net

- 1.1 `pnpm test`, `pnpm build`, `pnpm typecheck` green. Record any
  pre-existing failures so we don't blame them on the refactor.
- 1.2 Manually walk the current 4-step flow once and note exact behavior
  (snapshot for phase 13 QA).
- 1.3 Confirm via grep that `tournament-service.getMatches()` returns knockout
  matches with the phase field (`round-of-32` … `final`) and `groupId` is
  populated on group matches. Don't assume.
- 1.4 Grep for any external consumer of `PredictionStepMatches` /
  `PredictionStepGroups` / `TOTAL_STEPS`. Expect zero outside
  `PredictionsTemplate`.

**Exit:** baseline green; data shape confirmed; no code changed.

---

## Phase 2 — Pure helpers + bracket map

Create `src/utils/predictions-flow.ts` (all pure functions, no React, no
Firestore):

- 2.1 `getGroupMatches(allMatches, groupId)` → matches for one group.
- 2.2 `calculateGroupStandings(matches, predictions, teamsMap, groupId)` →
  reuse the logic currently in `calculatePredictedStandings`, scoped to one
  group. Refactor the existing function to call this helper per group so
  output is byte-identical.
- 2.3 `isGroupMatchesComplete(matches, predictions, groupId)` → all matches
  in group have a score.
- 2.4 `isGroupClassificationComplete(positions, group)` → all positions
  filled with unique teams.
- 2.5 `BRACKET_MAP` constant: declarative mapping from each knockout match
  slot to its source (`{ from: 'group', groupId: 'A', position: 1 }` or
  `{ from: 'winner-of', matchSlug: 'r32-m1' }`).
- 2.6 `buildKnockoutBracket(groupBetsByGroupId, knockoutMatches, knockoutBets)`
  → returns `KnockoutMatch[]` with `homeTeam` / `awayTeam` resolved according
  to `BRACKET_MAP`. Unfilled sources stay TBD.
- 2.7 `getPredictorProgress(predictor, allMatches, existingBets)` →
  `{ groupsSubmitted, totalGroups, knockoutSubmitted, totalKnockout,
  finalSubmitted, bestPlayersSubmitted }`. Used by phase 4 list cards and
  phase 11 step gating.
- 2.8 Unit tests in `src/utils/__tests__/predictions-flow.test.ts` for every
  helper. Cover empty / partial / full inputs, missing teams, TBD knockout
  resolution, multi-round chains.

**Exit:** helpers + tests merged. `calculatePredictedStandings` snapshot test
confirms identical output. No UI change.

---

## Phase 3 — Persist final phase + best players (latent bug fix)

Currently `handleFinalPhaseSubmit` and `handleBestPlayersSubmit` in
`PredictionsTemplate` only set local state. They must persist to Firestore
for "resume with checkmarks" to work.

- 3.1 Add to `types/firestore.ts`:
  - `FinalPhaseBet { userId, predictorId, first, second, third, fourth, points, createdAt, updatedAt }`
  - `BestPlayersBet { userId, predictorId, bestGoalkeeper, bestScorer, points, createdAt, updatedAt }`
- 3.2 New Firestore paths:
  - `tournaments/{tid}/final_phase_bets/{predictorId}`
  - `tournaments/{tid}/best_players_bets/{predictorId}`
- 3.3 Add to `predictionService`:
  - `submitFinalPhaseBet(userId, predictorId, data)`
  - `submitBestPlayersBet(userId, predictorId, data)`
  - Extend `getExistingBets` return value with `finalPhase: FinalPhaseBet | null`
    and `bestPlayers: BestPlayersBet | null` (additive — existing callers
    ignore the new fields).
- 3.4 Replace local-only state in `handleFinalPhaseSubmit` /
  `handleBestPlayersSubmit` with real service calls. Keep the existing
  feedback + `submittedSteps` add.
- 3.5 Hydrate `existingFinalPhase` / `existingBestPlayers` from the extended
  `getExistingBets` on mount, and add the corresponding steps to
  `submittedSteps` if a bet exists. Now refresh-with-checkmarks works for all
  four step kinds.
- 3.6 Firestore security rules: mirror the rules for `bets` on both new
  collections — `request.auth.uid == userId` to write.
- 3.7 Tests for the two new submit methods and the extended `getExistingBets`.

**Exit:** all four current step kinds round-trip through Firestore. Refresh-
with-checkmarks works end to end on the current flow.

---

## Phase 4 — Predictor service: edit, delete, list-with-stats

Extend `src/services/predictor-service.ts`:

- 4.1 `updatePredictor(userId, predictorId, patch: { name?; avatar? })` →
  `setDoc({ merge: true })`. Validate name (non-empty, ≤ 40 chars), avatar
  emoji (≤ 2 graphemes), bgColor (`/^#[0-9a-f]{6}$/i`).
- 4.2 `deletePredictor(userId, predictorId)` cascade delete in sequential
  `writeBatch` chunks of 500:
  1. `bets` where `predictorId == …`
  2. `group_bets` where `predictorId == …`
  3. `knockout_bets` where `predictorId == …`
  4. `final_phase_bets/{predictorId}`
  5. `best_players_bets/{predictorId}`
  6. `users/{uid}/predictors/{pid}/stats/{tid}`
  7. `users/{uid}/predictors/{pid}`

  Returns counts for telemetry. Idempotent (re-running on a partial delete
  cleans up the remainder).
- 4.3 `getUserPredictorsWithStats(userId, tournamentId)` → `Array<Predictor &
  { stats: PredictorStats | null; progress: ReturnType<getPredictorProgress> }>`.
  Parallel reads.
- 4.4 Add optional `avatar?: { bgColor: string; emoji: string }` to the
  `Predictor` interface. Additive, no migration.
- 4.5 Firestore security rules: verify only the owner can read/write/delete
  under `users/{uid}/predictors/**` and delete bets matching their own
  `predictorId`. If the current rules don't enforce this, tighten now. Add a
  rules test for the deny case.
- 4.6 Update `predictor-service.test.ts` with cases for rename,
  delete-with-bets, delete-with-no-bets, getUserPredictorsWithStats with
  mixed-progress predictors.

**Exit:** service + rules + tests merged. No UI references the new methods
yet.

---

## Phase 5 — Avatar primitive

Create `src/components/atoms/PredictorAvatar/PredictorAvatar.tsx`:

- 5.1 Props: `predictor: Predictor`, `size: 'sm' | 'md' | 'lg'`.
- 5.2 Render rules:
  - If `predictor.avatar?.emoji` exists → circle with `bgColor` background +
    emoji centered.
  - Else → circle with deterministic color from `hash(predictor.id)` + first
    letter of `predictor.name`.
- 5.3 Stories + tests: every size, with/without avatar, long names,
  two-grapheme emoji.

**Exit:** Storybook coverage; not referenced from app code yet.

---

## Phase 6 — Predictor list + editor + delete confirmation

Create three molecules under `src/components/molecules/`:

- 6.1 `PredictorList/PredictorList.tsx`:
  - Grid of cards, one per predictor: avatar, name, progress chip
    (`{done}/{total} groups`), points, overflow menu (Edit, Delete).
  - Final card: **"+ New prediction"**.
  - Empty state: just the create card.
- 6.2 `PredictorEditor/PredictorEditor.tsx`:
  - Modes `'create' | 'edit'`.
  - Name input + curated emoji picker (~24 options) + curated color palette
    (12 swatches).
  - Create → `predictorService.createPredictor` then `updatePredictor`
    (attach avatar). Edit → `updatePredictor`.
- 6.3 `PredictorDeleteConfirm/PredictorDeleteConfirm.tsx`:
  - Modal with "Type the name to confirm" gate. Guards against irreversible
    wipes.
- 6.4 Locale keys added in this phase (under `pages.predictions`):
  - `predictorList.title`, `predictorList.empty`, `predictorList.newButton`,
    `predictorList.progress`, `predictorList.points`
  - `predictorEditor.{createTitle, editTitle, nameLabel, emojiLabel,
    colorLabel, save, cancel}`
  - `predictorDelete.{title, confirmText, typeName, confirmButton}`
- 6.5 Stories: empty, 1 predictor, 5 mixed-progress, editor create, editor
  edit, delete confirm.

**Exit:** Storybook coverage; not yet wired into the page.

---

## Phase 7 — Per-group step component

Create `src/components/molecules/Predictions/PredictionStepGroup.tsx`
(singular):

- 7.1 Props: `group`, `groupMatches`, `teamsMap`, `existingMatchBets`,
  `existingGroupBet`, `matchPredictions`, `onMatchPredictionsChange`,
  `onSubmit`, `isDisabled`, `locale`, `translations`.
- 7.2 Layout: group header → match score inputs (reuse `PredictionForm`
  filtered) → live standings table (reuse table markup from
  `PredictionStepGroups`, scoped via `calculateGroupStandings`) →
  classification picker (reuse `GroupPredictionForm` filtered to a single
  group) → single "Save group" button.
- 7.3 Submit runs `submitBatchMatchBets` for the group's matches, then
  `submitBatchGroupBets` for the classification. Both must succeed before
  marking the step submitted. On partial failure, surface which half failed;
  refresh re-hydrates per-half from `existingMatchBets` / `existingGroupBets`,
  so the next render shows only the missing half.
- 7.4 Cannot submit until all matches scored AND classification fully ranked
  with unique positions. Inline hints.
- 7.5 Locale keys added: `stepGroupHeading`, `stepGroupMatches`,
  `stepGroupStandings`, `stepGroupClassification`, `hintFillAllMatches`,
  `hintRankAllTeams`, `submitGroupCombined`.
- 7.6 Stories for empty / partial / all-filled.

**Exit:** Storybook renders all states. Not referenced from the page yet.

---

## Phase 8 — Knockout-round step component

Create `src/components/molecules/Predictions/PredictionStepKnockoutRound.tsx`:

- 8.1 Props: `phase`, `roundMatches`, `groupBetsByGroupId`,
  `existingKnockoutBets`, `previousRoundPredictions`, `onSubmit`,
  `isDisabled`, `translations`.
- 8.2 Use `buildKnockoutBracket` (phase 2) to resolve home/away from group
  classifications and the user's earlier knockout picks. Unfilled sources
  render TBD.
- 8.3 Render via the existing `KnockoutBracketForm`, sliced to one phase.
- 8.4 Submit calls a new `predictionService.submitBatchKnockoutBets(userId,
  predictorId, predictions, matches)`. Extract the knockout branch already
  inside `submitBatchMatchBets` into this typed method; keep the old branch
  as a delegating shim so any existing caller still works.
- 8.5 Locale keys added: `stepRoundOf32`, `stepRoundOf16`,
  `stepQuarterfinals`, `stepSemifinals`, `stepThirdPlace`, `stepFinal`.
- 8.6 Stories with a fake `groupBetsByGroupId` fixture for each phase.

**Exit:** Storybook renders each round. Not referenced from the page yet.

---

## Phase 9 — Step-model abstraction in `PredictionsTemplate`

Internal-only refactor; behavior unchanged.

- 9.1 Define a discriminated union:

  ```ts
  type Step =
    | { kind: 'group';           id: string;     label: string }
    | { kind: 'knockout-round';  id: PhaseType;  label: string }
    | { kind: 'final-positions'; id: 'final';    label: string }
    | { kind: 'best-players';    id: 'best';     label: string }
    | { kind: 'matches-legacy';  id: 'matches';  label: string }
    | { kind: 'groups-legacy';   id: 'groups';   label: string };
  ```

- 9.2 `submittedSteps: Set<number>` → `Set<string>` keyed by `step.id`.
  Update every read/write.
- 9.3 `currentStep` stays a number — index into the `steps` array. Drop the
  `TOTAL_STEPS = 4` constant; derive from `steps.length`.
- 9.4 Build `steps` initially as the legacy 4 entries (`matches-legacy`,
  `groups-legacy`, `final-positions`, `best-players`). Behavior must be
  identical to before this phase.
- 9.5 `PredictionsProgress` and `PredictionsNavigation` take `steps` +
  `currentStepIndex` instead of `stepLabels` + magic numbers.

**Exit:** UI looks and behaves exactly as before. Internal model is now
extensible.

---

## Phase 10 — Predictions page becomes list-first

Restructure `PredictionsTemplate.tsx` outer shell.

- 10.1 Add view state: `view: 'list' | 'editor'`. URL sync via
  `?predictor=<id>` query param — presence means editor view, absence means
  list view. No router dep.
- 10.2 On mount with a logged-in user:
  - 0 predictors → `PredictorEditor` in create mode (gentler than empty
    list).
  - 1+ predictors and no `?predictor=` → `PredictorList`.
  - 1+ predictors and valid `?predictor=` → editor for that predictor;
    invalid id → fall back to list.
- 10.3 Card click → set query param, set `view: 'editor'`, set `currentStep:
  0` (always first step, per decision). Editor header shows `PredictorAvatar`
  + name + "← Back to predictions".
- 10.4 Hydrate `submittedSteps` from `getExistingBets` (now extended in phase
  3) — all completed steps show ✓ when entering the editor.
- 10.5 "Unsaved changes" prompt when leaving editor with dirty
  `matchPredictions`. Cheap: diff against last-submitted.
- 10.6 Remove the old single-shot `PredictorSelector` gate. Keep the file
  until phase 14.
- 10.7 Locale keys added: `editor.backToList`, `editor.unsavedChangesPrompt`.

**Exit:** manual walk-through:

- 0 predictors → create flow → land in editor.
- 1+ predictors → list → click card → editor with checkmarks for completed
  steps → back to list → switch predictor → independent state.
- Deep link `?predictor=<id>` resumes correctly; bogus id falls back to list.

The inside of the editor is still the legacy 4-step flow at this point.

---

## Phase 11 — Wire the new per-group / knockout step list

The only behavior-changing phase. Flag-gated for safe rollback.

- 11.1 Add `const USE_NEW_PREDICTIONS_FLOW = true;` at the top of
  `PredictionsTemplate.tsx`. One-line revert.
- 11.2 When `true`, build `steps` dynamically:

  ```
  [ ...groups.map(g => ({ kind:'group',          id:g.slug, label:g.name })),
    ...knockoutPhasesInTournamentOrder.map(p => ({ kind:'knockout-round', id:p, label:t(p) })),
    { kind:'final-positions', id:'final', label:t.stepFinalPhase },
    { kind:'best-players',    id:'best',  label:t.stepBestPlayers } ]
  ```

- 11.3 Render switch on `step.kind`:
  - `group` → `<PredictionStepGroup … />`
  - `knockout-round` → `<PredictionStepKnockoutRound … />`
  - `final-positions` → existing `<PredictionStepFinalPhase … />` (now
    persisting per phase 3)
  - `best-players` → existing `<PredictionStepBestPlayers … />` (now
    persisting per phase 3)
- 11.4 Local state `groupBetsByGroupId: Map<groupId, string[]>` hydrated
  from `getExistingBets`, updated on each group-step submit. Passed into
  knockout-round steps.
- 11.5 Local state `knockoutBetsByMatchSlug` hydrated and updated similarly.
  Passed forward so later rounds resolve TBDs.
- 11.6 `canAdvance` per step:
  - `group`: classification complete + matches submitted.
  - `knockout-round`: at least one new pick or already fully submitted.
  - `final-positions` / `best-players`: existing rules.
- 11.7 Progress bar with N + M + 2 dots. If it overflows ugly at >8 steps,
  add a `predictions-template__progress--compact` CSS variant in this phase.
- 11.8 With the flag `false`, the legacy step list still renders — proven
  rollback path.

**Exit:** flag-on path walks every group, every knockout round, top-4, best
players, end to end, with persistence and resume. Flag-off path matches phase
10 behavior.

---

## Phase 12 — Rankings + profile reconciliation

- 12.1 `rankings-service.getAllPredictorStats`: enrich each row by joining
  `users/{uid}/predictors/{predictorId}` for `name` + `avatar`. Parallel
  `Promise.all` over unique `(userId, predictorId)` pairs.
- 12.2 `RankingsTable.tsx`: confirm the displayed label is the **predictor's**
  `name` (not the user's display name). Read the file first; if needed,
  change to predictor name with user name as secondary text (`"Argentina
  Pool · Carlos S."`). Add `PredictorAvatar` next to the name.
- 12.3 `ProfileTemplate.tsx`: replace the hardcoded `${user.uid}-default`
  predictor with the list returned by `getUserPredictorsWithStats`. Each row
  deep-links to `/predictions?predictor=<id>`.
- 12.4 `build-data.ts`: if anything assumes a default predictor, fall back
  gracefully when none exists. Read first, only adjust if it actually breaks.

**Exit:** rankings shows one row per predictor with the correct name +
avatar. Profile lists all predictors per user.

---

## Phase 13 — QA matrix

All scenarios must be checked off in writing before phase 14.

### Core flow

- 13.1 Brand-new user: 0 predictors → create → walk every step → refresh →
  all submitted steps show ✓ → log out / in → state restored.
- 13.2 Resume mid-flow: user with half the groups submitted → refresh →
  those steps show ✓, classification readonly or pre-filled, other groups
  still editable.
- 13.3 Group classification change propagates to R32: change a top-2 pick →
  advance to R32 → TBD slots that resolved to that group update.
- 13.4 Locked matches: a match past `predictionDeadline` doesn't block
  group-step submission (existing `submitBatchMatchBets` skips them).
- 13.5 Empty standings: group with no submitted scores renders an empty
  table, not a crash.
- 13.6 Navigation gating: `canAdvance` blocks Next past unfinished groups;
  manually constructed knockout view with no group data renders TBD, not a
  crash.
- 13.7 Locale switch mid-flow updates labels.

### Multi-predictor

- 13.8 Create a second predictor; both appear in the list with independent
  progress and points.
- 13.9 Rename a predictor; persists after refresh and updates rankings.
- 13.10 Change avatar; persists and shows up in list, editor header,
  rankings.
- 13.11 Delete a predictor with submitted bets → confirmation gate works →
  after delete: predictor gone from list, bets gone from rankings, stats
  gone, deep link `?predictor=<id>` falls back to list.
- 13.12 Two predictors with overlapping bets render independent progress and
  rankings rows.
- 13.13 Deep link `?predictor=<id>` for a predictor that belongs to another
  user → security rules deny read → UI shows fallback to list.
- 13.14 Unsaved-changes prompt fires when leaving editor dirty; doesn't fire
  when clean.

### Regression

- 13.15 `pnpm test` green. New tests cover phase 2 helpers, phase 3 service
  additions, phase 4 service additions, phase 7/8 components, phase 10
  list-first wiring, phase 11 flag-on wiring.
- 13.16 No external consumer of removed symbols (`grep -rn
  "PredictionStepMatches\|PredictionStepGroups\|TOTAL_STEPS" src/` returns
  nothing outside `PredictionsTemplate`).
- 13.17 `pnpm build` green. `pnpm typecheck` green.

**Exit:** every box checked.

---

## Phase 14 — Remove legacy

- 14.1 Delete `PredictionStepMatches.tsx` and the all-at-once
  `PredictionStepGroups.tsx`. Keep `PredictionStepGroup.tsx` (singular).
- 14.2 Remove `matches-legacy` and `groups-legacy` from the `Step` union.
- 14.3 Remove the `USE_NEW_PREDICTIONS_FLOW` flag.
- 14.4 Remove the legacy `PredictorSelector` gate code path and (if unused
  elsewhere) the component file.
- 14.5 Remove now-dead locale keys: `stepMatches`, `stepMatchesDesc`,
  `stepGroups`, `stepGroupsDesc`, and `submitToAdvance` if unused by the new
  flow.
- 14.6 Final `pnpm test`, `pnpm build`, `pnpm typecheck`, lint. PR
  description lists every removed file and key.

**Exit:** zero references to deleted symbols; build green.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Step count explosion makes progress bar unreadable | Phase 11.7 adds compact CSS variant |
| `groupBetsByGroupId` / `knockoutBetsByMatchSlug` out of sync after submission | Updated in same callback that submits; also re-hydrated from `getExistingBets` on mount |
| `BRACKET_MAP` wrong → wrong teams in TBD slots | Phase 2 unit tests; phase 13.3 integration |
| Submit-partial-then-refresh (matches saved, classification not, or vice versa) | Group step submits matches then classification in order; refresh re-hydrates each half independently; next render shows only the missing half |
| Cascade delete partially fails mid-way | Sequential batches; idempotent — re-run cleans up the remainder. Surface "partial delete" state in the list with retry. |
| Security rules permit reading another user's predictor | Phase 4.5 explicit verification + rules test |
| Concurrent edits across two tabs overwrite each other | `updatePredictor` uses `merge: true`; last-write-wins acceptable for name/avatar |
| Legacy `avatar` absent on existing predictors | `PredictorAvatar` falls back to hashed-color + initial. Zero migration. |
| `KnockoutBracketForm` stale (in repo, never wired) | Read in phase 8 (already reviewed — TBD-aware and healthy); smoke test in stories |
| User creates unbounded predictors | "Unlimited" per decision; service signature allows adding a cap later without breaking callers |
| Rankings JOIN to predictor docs adds N reads | Acceptable at typical leaderboard sizes; parallelized; reassess if reads explode |

---

## Why nothing breaks

- **Phases 1–8 are purely additive.** New files, new optional fields, new
  collections. Old flow runs untouched.
- **Phase 9** is an internal model refactor inside `PredictionsTemplate`
  with no visible behavior change.
- **Phase 10** changes the page entry point but keeps the legacy 4-step
  flow inside.
- **Phase 11** is the only phase that swaps step content. One-line flag
  for rollback.
- **Phases 12–14** are clean-up after phase 13 proves correctness.

---

## Open questions to revisit later

- Should knockout matches show the predicted standings table from earlier
  groups as a reference panel? (Decision: not in v1; revisit after QA.)
- Should the predictor list show a sparkline of points over time? (Decision:
  not in v1; data exists in `PredictorStats.pointsHistory`.)
- Soft cap on predictors per user if abuse is observed? (Decision: defer.)
