# Roadmap: Quiniela

## Milestones

- ✅ **v1.0 Hardening** — production hardening before FIFA World Cup 2026 (shipped; tag `v1.0`)
- ✅ **v1.1 Avatars & UX Polish** — Phases 1-9 (shipped 2026-06-01) → [full detail](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 Bug Fixes** — Phases 10-13 (shipped 2026-06-02) → [full detail](milestones/v1.2-ROADMAP.md)
- ✅ **v1.3 Knockout Flow Fixes** — Phases 14-19, 21 (shipped 2026-06-03) → [full detail](milestones/v1.3-ROADMAP.md)
- 🚧 **v1.4 Full Scoring** — Phases 22-27 (planned)

## Phases

<details>
<summary>✅ v1.1 Avatars & UX Polish (Phases 1-9) — SHIPPED 2026-06-01</summary>

- [x] Phase 1: Environment & Config (3/3 plans) — completed 2026-05-31
- [x] Phase 2: UX / Layout Fixes (6/6 plans) — completed 2026-05-31
- [x] Phase 3: Predictor Identity Wiring (2/2 plans) — completed 2026-05-31
- [x] Phase 4: DiceBear Foundation (1/1 plan) — completed 2026-05-31
- [x] Phase 5: PredictorAvatar Atom Replacement (1/1 plan) — completed 2026-05-31
- [x] Phase 6: Rankings API Shape (1/1 plan) — completed 2026-06-01
- [x] Phase 7: AvatarPicker + PredictorEditor (3/3 plans) — completed 2026-06-01
- [x] Phase 8: Passive Migration (1/1 plan) — completed 2026-06-01
- [x] Phase 9: Production App Check — Rankings API (1/1 plan) — completed 2026-06-01

</details>

<details>
<summary>✅ v1.2 Bug Fixes (Phases 10-13) — SHIPPED 2026-06-02</summary>

- [x] Phase 10: Independent Quick-Wins (4/4 plans) — completed 2026-06-01
- [x] Phase 11: Profile Card + Chart (5/5 plans) — completed 2026-06-01
- [x] Phase 12: Knockout Pure-Util Foundation (3/4 plans) — completed 2026-06-02
- [x] Phase 13: Knockout Hook Rewire (5/5 plans) — completed 2026-06-02

</details>

<details>
<summary>✅ v1.3 Knockout Flow Fixes (Phases 14-19, 21) — SHIPPED 2026-06-03</summary>

- [x] Phase 14: R32 Selection Reset Blocker (1/1 plan) — completed 2026-06-02
- [x] Phase 15: Third-Place Data Load (1/1 plan) — completed 2026-06-02
- [x] Phase 16: Knockout Card UI + R32 Correctness Test (2/2 plans) — completed 2026-06-03
- [x] Phase 17: Favourite Select Contrast (1/1 plan) — completed 2026-06-02
- [x] Phase 18: Persisted Theme from localStorage (2/2 plans) — completed 2026-06-03
- [x] Phase 19: Expand DiceBear Avatar Options (4/4 plans) — completed 2026-06-02
- [x] Phase 21: Recolor Accent Button (1/1 plan) — completed 2026-06-03

</details>

### 🚧 v1.4 Full Scoring (planned)

- [x] **Phase 22: Scoring Constants Module** — Extract hardcoded point values into a shared module (completed 2026-06-03)
- [x] **Phase 23: Group Classification Scoring** — Score group classification bets (3/1 pts)
  - [x] 23-01-PLAN.md — `scoreGroupBet` pure function + `calculateGroupResults` trigger handler + tests + wire export
- [x] **Phase 24: Final Four Scoring** — Score final four bets (5/3 pts)
  - [x] 24-01-PLAN.md — deriveFinalStandings CF + calculateFinalFourResults CF + scoreFinalFourBet pure function + unit tests
- [x] **Phase 25: Best Players + Admin Surface** — Admin best-player input + scoring (5 pts each)
  - [x] 25-01-PLAN.md — admin surface + Cloud Function scoring + fuzzy matching
- [ ] **Phase 26: Badge Activation** — Award `top-10` and `clairvoyant` badges
- [ ] **Phase 27: Game Rules Page** — Localized documentation of full scoring ruleset (deferred from v1.3, renumbered from Phase 20)

## Phase Details

### Phase 22: Scoring Constants Module
**Goal**: Point values are centralized in a shared module instead of scattered as magic literals
**Depends on**: Nothing (foundation refactor on existing code)
**Requirements**: SCORE-05
**Success Criteria** (what must be TRUE):
  1. A scoring constants module exists with named exports for all point values (match exact/winner, group exact/position, final-four exact/position, best-player pick)
  2. The existing `calculateMatchResult` function (and any other scoring code) imports and uses the shared constants — zero magic literals remaining
  3. The constants module is structured for dual import: Cloud Functions (Node) and browser (Astro/rules page)
  4. Constants are exported with descriptive names that make the rules-page derivation self-evident
**Plans**: TBD

### Phase 23: Group Classification Scoring
**Goal**: Group classification bets are correctly scored after group matches finish
**Depends on**: Phase 22
**Requirements**: SCORE-01
**Success Criteria** (what must be TRUE):
   1. A Cloud Function scores group classification bets, awarding 3 pts for exact finishing position and 1 pt for a team that qualified but in the wrong position
   2. Scored points are persisted to the correct `group_bets` subcollection documents
   3. The predictor's total points reflect the new group classification scores
   4. Teams that didn't qualify or were not in the predicted position receive 0 pts
**Plans**: 1 plan

Plans:
- [ ] 23-01-PLAN.md — `scoreGroupBet` pure function + `calculateGroupResults` trigger handler + unit tests + wire export in `index.ts`

### Phase 24: Final Four Scoring
**Goal**: Final four bets (1st–4th position) are correctly scored
**Depends on**: Phase 22
**Requirements**: SCORE-02
**Success Criteria** (what must be TRUE):
  1. A Cloud Function scores final four bets, awarding 5 pts for exact predicted position and 3 pts for a team in the final four but in the wrong position
  2. Scored points are persisted to the correct `knockout_bets` subcollection documents
  3. The predictor's total points reflect the new final four scores
  4. Scoring correctly distinguishes between 1st, 2nd, 3rd, and 4th place
**Plans**: TBD

### Phase 25: Best Players + Admin Surface
**Goal**: Admin can enter actual tournament top scorer and best goalkeeper; best-player bets are scored against that source of truth
**Depends on**: Phase 22
**Requirements**: SCORE-03, SCORE-06
**Success Criteria** (what must be TRUE):
   1. An admin-only surface (restricted to users with admin role) exists to input the actual top scorer and best goalkeeper
   2. Admin-entered values persist to Firestore as the authoritative source of truth
   3. A Cloud Function scores best-player bets: 5 pts each for correctly picking the top scorer and/or best goalkeeper
   4. Scored points are reflected in the predictor's total
**Plans**: 1 plan
**UI hint**: yes

Plans:
- [x] 25-01-PLAN.md — admin surface + Cloud Function scoring + fuzzy matching

### Phase 26: Badge Activation
**Goal**: The `top-10` and `clairvoyant` badges are automatically awarded to qualifying predictors
**Depends on**: Phases 23, 24, 25 (needs scoring results to determine rankings and achievements)
**Requirements**: BADGE-01, BADGE-02
**Success Criteria** (what must be TRUE):
  1. The `top-10` badge is automatically awarded when a predictor ranks in the top 10 (ranking position plumbed into `checkAndAwardBadges`)
  2. The `clairvoyant` badge criteria is defined (e.g., N exact scorelines or exact knockout final score) and implemented
  3. Awarded badges appear on the predictor's profile and ranking entry
  4. Badge awards are triggered as part of the scoring pipeline, not a separate manual process
**Plans**: TBD

### Phase 27: Game Rules Page
**Goal**: A bilingual (es/en) game rules page documents the complete scoring ruleset, badge system, and confirms knockout-winner picks are prediction-only
**Depends on**: Phases 22, 23, 24, 25, 26 (all scoring must be implemented first so every value matches actual code)
**Requirements**: RULES-01, SCORE-04
**Success Criteria** (what must be TRUE):
  1. A bilingual rules page exists at localized routes (es/en) explaining all scoring mechanics
  2. The page documents match scoring (3/1/0), group classification scoring (3/1), final four scoring (5/3), and best players scoring (5 pts)
  3. The page explicitly states knockout-winner picks are prediction-only (not scored)
  4. All badge criteria are documented (earned badges and how to earn them)
  5. Every point value on the page derives from the scoring constants module (not hardcoded separately)
  6. Page is responsive at 360px, passable in both themes, and meets WCAG AA
**Plans**: TBD
**UI hint**: yes

## Backlog

### Phase 999.1: Follow-up — Phase 16 R32 correctness test (backlog)
- [ ] 16-01: formatSlotSource + R32 fixture (committed)
- [ ] 16-02: header removal + TeamSelector symmetry + slot-source labels (committed)

### Phase 999.2: Phase 12 extra summary (backlog)
- [ ] 12 has 4 summaries / 3 plans (extra doc artifact, not a gap)

### Phase 999.3: Deferred human UAT
- [ ] 27 human_uat items across 6 phases (02, 03, 05, 06, 07, 10) — visual/manual checks

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Environment & Config | v1.1 | 3/3 | Complete | 2026-05-31 |
| 2. UX / Layout Fixes | v1.1 | 6/6 | Complete | 2026-05-31 |
| 3. Predictor Identity Wiring | v1.1 | 2/2 | Complete | 2026-05-31 |
| 4. DiceBear Foundation | v1.1 | 1/1 | Complete | 2026-05-31 |
| 5. PredictorAvatar Atom Replacement | v1.1 | 1/1 | Complete | 2026-05-31 |
| 6. Rankings API Shape | v1.1 | 1/1 | Complete | 2026-06-01 |
| 7. AvatarPicker + PredictorEditor | v1.1 | 3/3 | Complete | 2026-06-01 |
| 8. Passive Migration | v1.1 | 1/1 | Complete | 2026-06-01 |
| 9. Production App Check — Rankings API | v1.1 | 1/1 | Complete | 2026-06-01 |
| 10. Independent Quick-Wins | v1.2 | 4/4 | Complete | 2026-06-01 |
| 11. Profile Card + Chart | v1.2 | 5/5 | Complete | 2026-06-01 |
| 12. Knockout Pure-Util Foundation | v1.2 | 3/4 | Complete | 2026-06-02 |
| 13. Knockout Hook Rewire | v1.2 | 5/5 | Complete | 2026-06-02 |
| 14. R32 Selection Reset Blocker | v1.3 | 1/1 | Complete | 2026-06-02 |
| 15. Third-Place Data Load | v1.3 | 1/1 | Complete | 2026-06-02 |
| 16. Knockout Card UI + R32 Correctness Test | v1.3 | 2/2 | Complete | 2026-06-03 |
| 17. Favourite Select Contrast | v1.3 | 1/1 | Complete | 2026-06-02 |
| 18. Persisted Theme from localStorage | v1.3 | 2/2 | Complete | 2026-06-03 |
| 19. Expand DiceBear Avatar Options | v1.3 | 4/4 | Complete | 2026-06-02 |
| 20 → 27 | Deferred→v1.4 Phase 27 | - | Renumbered | - |
| 21. Recolor Accent Button | v1.3 | 1/1 | Complete | 2026-06-03 |
| 22. Scoring Constants Module | v1.4 | 1/1 | Complete   | 2026-06-03 |
| 23. Group Classification Scoring | v1.4 | 0/1 | Planning | - |
| 24. Final Four Scoring | v1.4 | 1/1 | Complete   | 2026-06-03 |
| 25. Best Players + Admin Surface | v1.4 | 1/1 | Complete   | 2026-06-03 |
| 26. Badge Activation | v1.4 | 0/0 | Not started | - |
| 27. Game Rules Page | v1.4 | 0/0 | Not started | - |

---

*Last updated: 2026-06-03 — v1.4 roadmap defined (Phases 22-27). Next: `/gsd-plan-phase 22`.*
