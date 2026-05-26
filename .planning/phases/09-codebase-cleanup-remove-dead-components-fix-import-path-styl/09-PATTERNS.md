# Phase 9: Codebase Cleanup — Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 86 (46 barrel-import files + 40 React-import files)
**Analogs found:** 3 pattern categories / 9+ analog files read

## File Classification

| Work Item | File Category | Role | Data Flow | Files Count | Closest Analog | Match Quality |
|-----------|--------------|------|-----------|-------------|----------------|---------------|
| Barrel import fix | `src/components/atoms/*/index.ts` (12 exist) | config (barrel) | — | 12 existing, 5 new | `src/components/atoms/Typography/index.ts` | exact |
| Barrel import fix | `src/components/molecules/*/index.ts` (18 component dirs) | config (barrel) | — | 2 existing, 16 new | `src/components/molecules/LoginForm/index.ts` | exact |
| Barrel import fix | `src/components/organisms/*/index.ts` (11 imported) | config (barrel) | — | 0 existing, 11 new | `src/components/atoms/Typography/index.ts` | role-match |
| Barrel import fix | 46 consumer files with duplicate-path imports | mixed | mixed | 46 | `src/components/organisms/NavBar/NavBar.tsx` | exact |
| React import removal | 40 TSX files with `import React from 'react'` | mixed | mixed | 40 | `src/components/molecules/Predictions/PredictionStepFinal.tsx` | exact |
| Dead component analysis | 6 Storybook-only components | component | — | 6 (doc only) | N/A (no app imports) | N/A |

## Pattern Assignments

### Work Item 1: Barrel Import Standardization

#### Pattern 1A — Existing barrel file (copy this pattern for new barrel files)

**Analog:** `src/components/atoms/Typography/index.ts` (12 existing atoms + 2 molecules)

**Canonical barrel pattern (lines 1-2):**
```typescript
export { Typography } from './Typography';
export type { TypographyProps, TypographyVariant } from './Typography';
```

**Other examples of the same pattern:**

`src/components/atoms/Button/index.ts`:
```typescript
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
```

`src/components/atoms/Icon/index.ts`:
```typescript
export { Icon } from './Icon';
export type { IconProps, IconName } from './Icon';
```

`src/components/atoms/Input/index.ts`:
```typescript
export { Input } from './Input';
export type { InputProps, InputVariant } from './Input';
```

`src/components/atoms/Badge/index.ts`:
```typescript
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';
```

`src/components/atoms/Avatar/index.ts`:
```typescript
export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';
```

`src/components/atoms/Spinner/index.ts`:
```typescript
export { Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner';
```

`src/components/atoms/Tooltip/index.ts`:
```typescript
export { Tooltip } from './Tooltip';
export type { TooltipProps, TooltipPosition } from './Tooltip';
```

`src/components/atoms/ProgressBar/index.ts`:
```typescript
export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps, ProgressBarVariant } from './ProgressBar';
```

`src/components/atoms/Divider/index.ts`:
```typescript
export { Divider } from './Divider';
export type { DividerProps } from './Divider';
```

`src/components/atoms/Checkbox/index.ts`:
```typescript
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';
```

`src/components/atoms/Radio/index.ts`:
```typescript
export { Radio } from './Radio';
export type { RadioProps } from './Radio';
```

`src/components/molecules/LoginForm/index.ts`:
```typescript
export { LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm';
```

`src/components/molecules/RegisterForm/index.ts`:
```typescript
export { RegisterForm } from './RegisterForm';
export type { RegisterFormProps } from './RegisterForm';
```

**Rule:** Every barrel file exports the default export with `export { ComponentName } from './ComponentName'` on line 1, and any associated types on line 2 with `export type { ... }`.

---

#### Pattern 1B — Current WRONG import (before fix)

**Analog:** `src/components/organisms/NavBar/NavBar.tsx` (line 2)
**Pattern:** `@atoms/Icon/Icon` — duplicate directory/file path

```typescript
import { Icon } from '@atoms/Icon/Icon';
```

**Analog:** `src/components/templates/PredictionsTemplate/PredictionsTemplate.tsx` (lines 2-12)
**Pattern:** Multiple duplicate-path imports in one file

```typescript
import { PredictorList, type PredictorListEntry } from '@molecules/PredictorList/PredictorList';
import { PredictorEditor } from '@molecules/PredictorEditor/PredictorEditor';
import { PredictorDeleteConfirm } from '@molecules/PredictorDeleteConfirm/PredictorDeleteConfirm';
import {
  PredictionsProgress,
  PredictionsFeedback,
  PredictionsNavigation,
} from '@molecules/Predictions/PredictionsUI';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
```

**Analog:** `src/components/organisms/UserProfile/UserProfile.tsx` (lines 2-5)
**Pattern:** Mixed value + type imports with duplicate path

```typescript
import { StatCard } from '@molecules/StatCard/StatCard';
import { Avatar } from '@atoms/Avatar/Avatar';
import { Typography } from '@atoms/Typography/Typography';
import { Icon, type IconName } from '@atoms/Icon/Icon';
```

**Analog:** `src/types/badges.ts` (line 1)
**Pattern:** Type-only import with duplicate path

```typescript
import type { IconName } from '@atoms/Icon/Icon';
```

**Analog:** `src/components/molecules/MatchCard/MatchCard.tsx` (lines 2-5)
**Pattern:** Mixed internal imports + duplicate-path atom imports

```typescript
import { TeamFlag } from '@molecules/TeamFlag/TeamFlag';
import { Badge } from '@atoms/Badge/Badge';
import { Typography } from '@atoms/Typography/Typography';
import { Icon, type IconName } from '@atoms/Icon/Icon';
```

---

#### Pattern 1C — CORRECT import after fix (target pattern)

Replace `@atoms/ComponentName/ComponentName` → `@atoms/ComponentName`
Replace `@molecules/ComponentName/ComponentName` → `@molecules/ComponentName`
Replace `@organisms/ComponentName/ComponentName` → `@organisms/ComponentName`

**Before → After transform:**

| Before | After |
|--------|-------|
| `import { Icon } from '@atoms/Icon/Icon'` | `import { Icon } from '@atoms/Icon'` |
| `import { Typography } from '@atoms/Typography/Typography'` | `import { Typography } from '@atoms/Typography'` |
| `import { Button } from '@atoms/Button/Button'` | `import { Button } from '@atoms/Button'` |
| `import { Spinner } from '@atoms/Spinner/Spinner'` | `import { Spinner } from '@atoms/Spinner'` |
| `import { Badge } from '@atoms/Badge/Badge'` | `import { Badge } from '@atoms/Badge'` |
| `import { Avatar } from '@atoms/Avatar/Avatar'` | `import { Avatar } from '@atoms/Avatar'` |
| `import { Input } from '@atoms/Input/Input'` | `import { Input } from '@atoms/Input'` |
| `import { Radio } from '@atoms/Radio/Radio'` | `import { Radio } from '@atoms/Radio'` |
| `import { PixelArt } from '@atoms/PixelArt/PixelArt'` | `import { PixelArt } from '@atoms/PixelArt'` * |
| `import { PredictorAvatar } from '@atoms/PredictorAvatar/PredictorAvatar'` | `import { PredictorAvatar } from '@atoms/PredictorAvatar'` * |
| `import { Toast } from '@atoms/Toast/Toast'` | `import { Toast } from '@atoms/Toast'` * |
| `import { Icon, type IconName } from '@atoms/Icon/Icon'` | `import { Icon, type IconName } from '@atoms/Icon'` |
| `import { MatchCard, type MatchCardProps } from '@molecules/MatchCard/MatchCard'` | `import { MatchCard, type MatchCardProps } from '@molecules/MatchCard'` * |
| `import { RankingRow } from '@molecules/RankingRow/RankingRow'` | `import { RankingRow } from '@molecules/RankingRow'` * |
| `import { TeamFlag } from '@molecules/TeamFlag/TeamFlag'` | `import { TeamFlag } from '@molecules/TeamFlag'` * |
| `import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings'` | `import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings'` * |
| `import type { RankingsTableProps } from '@organisms/RankingsTable/RankingsTable'` | `import type { RankingsTableProps } from '@organisms/RankingsTable'` * |
| `import { TournamentHeader } from '@organisms/TournamentHeader/TournamentHeader'` | `import { TournamentHeader } from '@organisms/TournamentHeader'` * |

`*` Requires barrel file creation first (no existing index.ts)

---

**Pattern 1D — Consumer file already needing barrel files created for molecules/organisms (imports that need new barrels)**

**Analog:** `src/services/live-data-service.ts` (lines 4-6) — type-only imports with no existing barrel:

```typescript
import type { MatchCardProps } from '@molecules/MatchCard/MatchCard';
import type { GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings';
import type { RankingEntry } from '@organisms/RankingsTable/RankingsTable';
```

**Analog:** `src/hooks/usePredictionSteps.tsx` (lines 9-14) — component + type imports:

```typescript
import { PredictionStepGroup } from '@molecules/Predictions/PredictionStepGroup';
import { PredictionStepKnockoutRound } from '@molecules/Predictions/PredictionStepKnockoutRound';
import {
  PredictionStepFinalPhase,
  PredictionStepBestPlayers,
} from '@molecules/Predictions/PredictionStepFinal';
```

**Analog:** `src/components/organisms/KnockoutBracketForm/KnockoutBracketForm.tsx` (lines 2-4):

```typescript
import { TeamSelector } from '@molecules/TeamSelector/TeamSelector';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
```

---

### Work Item 2: React Import Removal

#### Pattern 2A — Current WRONG (before removal)

**40 TSX files** have `import React from 'react'` on line 1.

**Analog:** `src/components/atoms/Button/Button.tsx` (line 1):
```typescript
import React from 'react';
```

**Analog:** `src/components/organisms/NavBar/NavBar.tsx` (line 1) — combined React + hooks import:
```typescript
import React, { useEffect, useState } from 'react';
```

**Analog:** `src/components/templates/PredictionsTemplate/PredictionsTemplate.tsx` (line 1):
```typescript
import React, { useEffect, useState, useCallback } from 'react';
```

**Analog:** `src/components/molecules/Predictions/PredictionStepGroup.tsx` (line 1):
```typescript
import React from 'react';
```

#### Pattern 2B — CORRECT (after removal)

**No `import React` line.** React 19 auto-JSX means it's not needed.

For files where `React` was only used for JSX: remove the entire `import React from 'react'` line.

For files where `React` was used for types like `React.FC`, `React.ReactNode`, `React.useState`: replace those usages with direct imports or remove them.

**Analog:** `src/components/atoms/AuthGuard/AuthGuard.tsx` is NOT a good example (it still has the old pattern). There is NO file in the codebase that correctly omits `import React`. This is the clean target state:

**Before (Wrong):**
```typescript
import React from 'react';
import { useAuthStore } from '@store/auth-store';
import { Button } from '@atoms/Button/Button';
```

**After (Correct):**
```typescript
import { useAuthStore } from '@store/auth-store';
import { Button } from '@atoms/Button/Button';
```

**Special case — `React.FC` and `React.ReactNode`:** Files that use `React.FC<Props>` must either (a) remove the import and update `React.FC` to remove the `React.` prefix if FC is no longer needed in React 19, or (b) keep React import if truly needed for types.

From `src/components/atoms/AuthGuard/AuthGuard.tsx` (lines 8, 15):
```typescript
export interface AuthGuardProps {
  children: React.ReactNode;
  // ...
}
export const AuthGuard: React.FC<AuthGuardProps> = ({ ... }) => {
```

**Special case — combined import:** Files like `NavBar.tsx` that import `React` alongside hooks:
```typescript
// Before:
import React, { useEffect, useState } from 'react';
// After:
import { useEffect, useState } from 'react';
```

**Special case — `React.useId()`:** In files where `React` is used as a namespace (e.g., `React.useId()`), remove `import React` and import the specific hook instead:
```typescript
// Before:
import React from 'react';
// ... later:
const id = React.useId();
// After:
import { useId } from 'react';
const id = useId();
```

---

### Work Item 3: Dead Component Analysis (Documentation Only)

Six components have zero app imports — only used in their own `.stories.tsx` and/or `.test.tsx` files.

| Component | Path | Has .stories.tsx | Has .test.tsx | Total Files |
|-----------|------|-----------------|---------------|-------------|
| **AuthGuard** | `src/components/atoms/AuthGuard/` | ✅ | ❌ | 2 (.tsx + .css + .stories) |
| **DesignTokens** | `src/components/atoms/DesignTokens/` | ✅ | ❌ | 2 (.stories.tsx + .css, NO component .tsx) |
| **ScoreDisplay** | `src/components/molecules/ScoreDisplay/` | ✅ | ✅ | 4 (.tsx + .test.tsx + .stories.tsx + .css) |
| **KnockoutBracketForm** | `src/components/organisms/KnockoutBracketForm/` | ✅ | ❌ | 3 (.tsx + .stories.tsx + .css) |
| **NotificationPanel** | `src/components/organisms/NotificationPanel/` | ✅ | ✅ | 4 (.tsx + .test.tsx + .stories.tsx + .css) |
| **PredictionTemplate** | `src/components/templates/PredictionTemplate/` | ✅ | ✅ | 4 (.tsx + .test.tsx + .stories.tsx + .css) |

**Verification:** `grep` for `from.*AuthGuard` (etc.) across all `src/` shows only self-referencing imports in the component's own test/stories files. No cross-file app imports exist.

**Note:** `PredictionTemplate` appears in CONTEXT.md's dead component list but is in `src/components/templates/` (not atoms/molecules/organisms), so it won't get a barrel file. It still has duplicate-path imports internally and needs `import React` removal.

---

## Shared Patterns

### Pattern: Barrel file creation boilerplate

**Apply to:** 16 molecule directories + 11 organism directories + 5 atom directories without index.ts

**Template** (copy `src/components/atoms/Typography/index.ts`):
```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

Follow the existing convention: line 1 exports the component, line 2 exports the props type. Check the actual component's exports to determine what types to re-export.

### Pattern: Sed substitution for barrel import standardization

All 46 files follow the same pattern — replace last segment of the path:

```bash
# For all atoms, molecules, organisms: strip duplicate path segment
# @atoms/Foo/Foo -> @atoms/Foo
# @molecules/Foo/Foo -> @molecules/Foo
# @organisms/Foo/Foo -> @organisms/Foo

# sed approach for atoms:
sed -i '' "s|from '@atoms/\([^/']*\)/\1'|from '@atoms/\1'|g" <file>

# sed approach for molecules:
sed -i '' "s|from '@molecules/\([^/']*\)/\1'|from '@molecules/\1'|g" <file>

# sed approach for organisms:
sed -i '' "s|from '@organisms/\([^/']*\)/\1'|from '@organisms/\1'|g" <file>
```

**Edge case — Predictions subdirectory:** The `@molecules/Predictions/` subdirectory has multiple component files (PredictionsUI, PredictionStepGroup, PredictionStepKnockoutRound, PredictionStepFinal). These are imported via `@molecules/Predictions/ComponentName` — moving to `@molecules/Predictions` barrel could change semantics. Verify the barrel export approach for this multi-component directory.

### Pattern: Sed substitution for React import removal

```bash
# Remove standalone 'import React from 'react''
sed -i '' "/^import React from 'react';$/d" <file>

# Remove 'import React,' at start of combined import
sed -i '' "s/^import React, {/import {/" <file>
```

### Verification sequence

**After both sed passes:**
```bash
pnpm lint          # Check for any import/lint issues
pnpm test:run      # Tests should still pass after barrel changes
pnpm build         # Build must work — confirms all imports resolve
```

## No Analog Found

| File Pattern | Role | Reason for No Analog |
|-------------|------|---------------------|
| Files after `import React` removal | — | No existing file in codebase omits this import. Target state is pure removal. |
| Dead component analysis report | doc | No prior dead component audit in codebase. |

## Metadata

**Analog search scope:**
- `src/components/atoms/**/*.ts` — 12 barrel files found
- `src/components/molecules/**/*.ts` — 2 barrel files found
- `src/components/organisms/**/*.ts` — 0 barrel files found
- `src/**/*.tsx` — 40 files with `import React from 'react'`
- `src/**/*.{ts,tsx}` — 92+ atoms, 36 molecule, 15 organism duplicate-path imports

**Files scanned:** ~200 component/app files across `src/`

**Pattern extraction date:** 2026-05-27
