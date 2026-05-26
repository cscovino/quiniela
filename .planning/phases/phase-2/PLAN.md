# Phase 2: Create Storybook Stories for All Components

**Goal:** Create Storybook stories for every possible component so the user can develop focusing on one component at a time — fixing issues like the NavBar's scroll-through bug in isolation.

**Depends on:** Phase 1 (complete)

## Component Audit Summary

### Components WITH stories (38 existing)
All atoms (15), molecules (14), organisms (8), and templates (2) already have `.stories.tsx` files. See full list below.

### Components WITHOUT stories — need creation (19 React TSX + 5 Astro)

| Level | Component | Priority | Complexity |
|-------|-----------|----------|------------|
| Atoms | `AuthGuard` | High | Low (~50 lines) |
| Atoms | `Toast` (ToastContainer) | High | Low (~60 lines) |
| Molecules | `LoginForm` | High | Medium (~100 lines) |
| Molecules | `RegisterForm` | High | Medium (~100 lines) |
| Molecules | `AdminMatchResultForm` | Medium | Medium (~80 lines) |
| Molecules | `PointsChart` | Medium | Medium (~80 lines) |
| Molecules | `PredictionsUI` (3 sub-components) | High | Medium (~90 lines) |
| Molecules | `PredictionStepFinal` (2 sub-components) | High | Medium (~70 lines) |
| Organisms | `BestPlayersForm` | High | Low (~50 lines) |
| Organisms | `FinalPhaseForm` | High | Medium (~80 lines) |
| Organisms | `GroupPredictionForm` | High | Medium (~100 lines) |
| Organisms | `KnockoutBracketForm` | High | Medium (~90 lines) |
| Organisms | `AdminMatchesPage` | Medium | High (Firestore dep) |
| Organisms | `AdminMatchList` | Medium | Medium (~80 lines) |
| Organisms | `NavBar` | **Critical** | Medium (~120 lines + CSS fix) |
| Organisms | `PWAInstall` | Medium | Low (~50 lines) |
| Organisms | `ToastProvider` | Low | Trivial (~15 lines) |
| Templates | `AuthTemplate` | High | Medium (~80 lines) |
| Templates | `PredictionsTemplate` | High | High (~150 lines) |
| Astro | `AuthPage`, `PredictionsPage`, `ProfilePage`, `RankingsPage`, `TournamentPage` | Low | Documentation only |

### Existing stories that need improvement
- None specifically flagged — the user's focus is on new stories and the NavBar fix

## Plan Structure — 7 Plans in 2 Waves

### Wave 1 (6 parallel plans — no file conflicts)

| Plan | Focus | Files Changed | Tasks |
|------|-------|--------------|-------|
| **02-01** | NavBar fix + story | `NavBar.tsx`, `NavBar.css`, `NavBar.stories.tsx` | 2 |
| **02-02** | Simple atoms/utilities | `AuthGuard.stories.tsx`, `Toast.stories.tsx`, `ToastProvider.stories.tsx`, `PWAInstall.stories.tsx` | 2 |
| **02-03** | Auth form molecules | `LoginForm.stories.tsx`, `RegisterForm.stories.tsx` | 2 |
| **02-04** | Prediction/admin molecules | `PointsChart.stories.tsx`, `PredictionsUI.stories.tsx`, `PredictionStepFinal.stories.tsx`, `AdminMatchResultForm.stories.tsx` | 2 |
| **02-05** | Prediction form organisms | `BestPlayersForm.stories.tsx`, `FinalPhaseForm.stories.tsx`, `GroupPredictionForm.stories.tsx`, `KnockoutBracketForm.stories.tsx` | 2 |
| **02-06** | Admin organisms | `AdminMatchesPage.stories.tsx`, `AdminMatchList.stories.tsx` | 2 |

### Wave 2 (depends on 02-03)

| Plan | Focus | Files Changed | Tasks |
|------|-------|--------------|-------|
| **02-07** | Templates + Astro docs | `AuthTemplate.stories.tsx`, `PredictionsTemplate.stories.tsx`, `AstroPageComponents.md` | 2 |

## Existing Stories Reference (38 files)

These already exist and do NOT need re-creation:

### Atoms (15)
`Button`, `Input`, `Typography`, `Avatar`, `Spinner`, `Badge`, `Checkbox`, `Radio`, `ProgressBar`, `Divider`, `Icon`, `Tooltip`, `PixelArt`, `PredictorAvatar`, `DesignTokens`

### Molecules (14)
`MatchCard`, `TeamSelector`, `TeamFlag`, `ScoreDisplay`, `StatCard`, `RankingRow`, `CountdownTimer`, `GroupHeader`, `PredictionInput`, `PredictionStepGroup`, `PredictionStepKnockoutRound`, `PredictorEditor`, `PredictorDeleteConfirm`, `PredictorList`

### Organisms (8)
`TournamentHeader`, `MatchList`, `GroupStandings`, `PredictionForm`, `RankingsTable`, `NotificationPanel`, `UserProfile`

### Templates (2)
`PredictionTemplate`, `ProfileTemplate`

## Key Technical Decisions

1. **Story pattern:** Use `@storybook/react-vite` consistently (all existing stories use this). Each story file follows the `Meta`/`StoryObj` pattern with `tags: ['autodocs']`.

2. **Firestore/Auth mocking:** `.storybook/main.ts` already has a `firebaseMockPlugin` that resolves `firebase/*` imports to `src/test/firebase-mock.ts`. For Zustand stores (`useAuthStore`, `useToastStore`), call `store.setState()` directly in stories to set desired state before render.

3. **Complex state components:** For components with internal state that's hard to control (PredictionsTemplate), use wrapper components inside stories or decorators to inject state. This avoids refactoring the source component.

4. **NavBar CSS fixes:**
   - **Scroll-through fix:** Add `useEffect` in `NavBar.tsx` that sets `document.body.style.overflow = 'hidden'` when `menuOpen` is true, resets on close/unmount
   - **Sticky fix:** Check parent layout components for `overflow: hidden`/`auto`. The `.nav-bar` already has `position: sticky; top: 0; z-index: 100` — if parent has `overflow`, replace with `overflow: clip`

5. **Astro components:** Cannot have standard Storybook stories. Document their pattern in a reference doc. Their underlying React templates get full Storybook coverage.

## Verification

Each plan verifies independently:
- `pnpm build-storybook` succeeds (all plans)
- `pnpm lint` passes (plan 02-01 only, since it modifies source)
- Individual stories render without errors in Storybook dev server

## Final Output

- 19 new `.stories.tsx` files
- 1 Astro component documentation file
- 1 NavBar CSS fix (2 files modified)
- `pnpm build-storybook` passes with zero errors
- Updated ROADMAP.md marking Phase 2 complete

---

**Plan files stored at:**
- `.planning/phases/02-create-stories-for-all-possible-components-so-i-can-develop/02-01-PLAN.md` through `02-07-PLAN.md`
