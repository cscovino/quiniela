# Dead Components Analysis — Storybook-Only Artifacts

> **Decision D-01 (from CONTEXT.md):** Analysis only. No deletions. User reviews and decides on removal.

## Summary

| Component | Path | App Imports | Has Stories | Has Tests | Total Files | Est. Removal Impact |
|-----------|------|-------------|-------------|-----------|-------------|---------------------|
| AuthGuard | `src/components/atoms/AuthGuard/` | 0 | Yes | No | 3 (tsx, css, stories) | Low — 51 lines, no app deps |
| DesignTokens | `src/components/atoms/DesignTokens/` | 0 | Yes | No | 2 (css, stories) | Low — design reference only |
| ScoreDisplay | `src/components/molecules/ScoreDisplay/` | 0 | Yes | Yes | 5 (tsx, css, stories, test, barrel) | Low — 58 lines, has test |
| KnockoutBracketForm | `src/components/organisms/KnockoutBracketForm/` | 0 | Yes | No | 4 (tsx, css, stories, barrel) | Medium — 130 lines, complex form |
| NotificationPanel | `src/components/organisms/NotificationPanel/` | 0 | Yes | Yes | 5 (tsx, css, stories, test, barrel) | Medium — 97 lines, has test |
| PredictionTemplate | `src/components/templates/PredictionTemplate/` | 0 | Yes | Yes | 5 (tsx, css, stories, test, barrel) | Low — 44 lines, wrapper component |

## Notes

- **ScoreDisplay**, **KnockoutBracketForm**, **NotificationPanel**, and **PredictionTemplate** now have barrel `index.ts` files (created in Wave 1) despite being dead — this is SAFE because barrel files are zero-cost re-exports with no runtime impact. They can be removed together with the component directory when deletion is decided.
- **Total dead code footprint:** ~749 lines across 24 files.

---

## 1. AuthGuard (`src/components/atoms/AuthGuard/`)

**Files in directory:**
- `AuthGuard.tsx` — 51 lines, 1,292 bytes
- `AuthGuard.css` — 505 bytes
- `AuthGuard.stories.tsx` — 1,558 bytes

**App imports:** None confirmed.
```
grep -rn "from.*AuthGuard/" src/ --include='*.ts' --include='*.tsx'
# Results: (empty — only self-referencing imports in stories)
```

**Where used:** Stories only (`AuthGuard.stories.tsx`).

**Feature role:** A wrapper component that checks `useAuthStore` for authentication state. Shows a loading spinner while auth initializes, a login prompt if unauthenticated, or renders children when authenticated. This functionality is handled at the page level in `AuthTemplate` and by `@services/auth-bootstrap` instead.

**Storybook coverage:** Stories demonstrate protected/unauthenticated/loading states.

**Recommendation:** Keep (analysis only per D-01). Can be safely deleted if auth guards remain page-level.

---

## 2. DesignTokens (`src/components/atoms/DesignTokens/`)

**Files in directory:**
- `DesignTokens.stories.tsx` — 369 lines, 15,101 bytes
- `DesignTokens.css` — 5,012 bytes

**App imports:** None confirmed.
```
grep -rn "from.*DesignTokens/" src/ --include='*.ts' --include='*.tsx'
# Results: (empty)
```

**Where used:** Stories only.

**Feature role:** A Storybook-only visual reference page showing the full design token system — colors, gradients, typography scale, spacing scale, and shadow presets. Has no component `.tsx` file (only stories + CSS).

**Storybook coverage:** 4 stories: Colors, Gradients, Typography, Spacing, Shadows.

**Recommendation:** Keep (analysis only per D-01). Design reference docs with zero app code impact.

---

## 3. ScoreDisplay (`src/components/molecules/ScoreDisplay/`)

**Files in directory:**
- `ScoreDisplay.tsx` — 58 lines, 1,713 bytes
- `ScoreDisplay.css` — 634 bytes
- `ScoreDisplay.stories.tsx` — 997 bytes
- `ScoreDisplay.test.tsx` — 924 bytes
- `ScoreDisplay/index.ts` — 104 bytes (barrel, created Wave 1)

**App imports:** None confirmed.
```
grep -rn "from.*ScoreDisplay/" src/ --include='*.ts' --include='*.tsx'
# Results: (empty — only self-referencing imports in stories)
```

**Where used:** Stories and tests only.

**Feature role:** Displays a match score with home/away numbers and a points badge for exact/correct-winner results. Intended for use in match history or prediction review — but inline score rendering is done directly in `MatchCard` instead.

**Storybook coverage:** 4 stories: NoPoints, ExactPrediction, CorrectWinner, AllVariants.

**Has tests:** Yes — `ScoreDisplay.test.tsx` exists.

**Recommendation:** Keep (analysis only per D-01). Has test coverage; could be useful when match history feature is built.

---

## 4. KnockoutBracketForm (`src/components/organisms/KnockoutBracketForm/`)

**Files in directory:**
- `KnockoutBracketForm.tsx` — 130 lines, 4,242 bytes
- `KnockoutBracketForm.css` — 1,139 bytes
- `KnockoutBracketForm.stories.tsx` — 2,795 bytes
- `KnockoutBracketForm/index.ts` — 147 bytes (barrel, created Wave 1)

**App imports:** None confirmed.
```
grep -rn "from.*KnockoutBracketForm/" src/ --include='*.ts' --include='*.tsx'
# Results: (empty — only self-referencing imports in stories)
```

**Where used:** Stories only.

**Feature role:** A knockout bracket prediction form where users pick winners for each match in a phase. Groups matches by phase label (Round of 16, Quarter-finals, etc.). Uses `TeamSelector` for each match. Knockout predictions are handled via `FinalPhaseForm` in the actual app.

**Storybook coverage:** Stories exist but not inspected in detail.

**Recommendation:** Keep (analysis only per D-01). Largest dead component by line count. Could be deleted if `FinalPhaseForm` fully replaces its functionality.

---

## 5. NotificationPanel (`src/components/organisms/NotificationPanel/`)

**Files in directory:**
- `NotificationPanel.tsx` — 97 lines, 3,061 bytes
- `NotificationPanel.css` — 1,712 bytes
- `NotificationPanel.stories.tsx` — 1,628 bytes
- `NotificationPanel.test.tsx` — 2,608 bytes
- `NotificationPanel/index.ts` — 156 bytes (barrel, created Wave 1)

**App imports:** None confirmed.
```
grep -rn "from.*NotificationPanel/" src/ --include='*.ts' --include='*.tsx'
# Results: (empty — only self-referencing imports in stories)
```

**Where used:** Stories and tests only.

**Feature role:** A notification panel UI displaying a list of notifications with type icons (match_start, result_posted, badge_earned, ranking_change), read/unread states, mark-as-read, and clear-all actions. Notification features (FCM push) are handled via service worker, not this component.

**Storybook coverage:** 3 stories: Default, Empty, AllRead.

**Has tests:** Yes — `NotificationPanel.test.tsx` exists.

**Recommendation:** Keep (analysis only per D-01). Has test coverage; could be used if in-app notification center is built.

---

## 6. PredictionTemplate (`src/components/templates/PredictionTemplate/`)

**Files in directory:**
- `PredictionTemplate.tsx` — 44 lines, 1,403 bytes
- `PredictionTemplate.css` — 644 bytes
- `PredictionTemplate.stories.tsx` — 1,303 bytes
- `PredictionTemplate.test.tsx` — 1,116 bytes
- (no barrel needed — `templates/` not in plan scope)

**App imports:** None confirmed.
```
grep -rn "from.*PredictionTemplate/" src/ --include='*.ts' --include='*.tsx'
# Results: (empty — only self-referencing imports in stories)
```

**Where used:** Stories and tests only.

**Feature role:** A layout template wrapping `PredictionForm` with a countdown timer header. The actual prediction UI uses `PredictionsTemplate` (with step wizard), not this wrapper.

**Storybook coverage:** Stories exist but not inspected in detail.

**Has tests:** Yes — `PredictionTemplate.test.tsx` exists.

**Recommendation:** Keep (analysis only per D-01). Superseded by `PredictionsTemplate`. Has test coverage.
