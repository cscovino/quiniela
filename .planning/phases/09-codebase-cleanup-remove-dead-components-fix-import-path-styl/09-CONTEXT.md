# Phase 9 CONTEXT — Codebase cleanup

## Phase Goal
Remove dead code, standardize import paths, and clean up unnecessary React imports.

## Gray Area Decisions

### Dead component removal — Analysis only, no deletions now
- **Findings**: 6 Storybook-only components with zero app imports: `AuthGuard`, `DesignTokens`, `ScoreDisplay`, `KnockoutBracketForm`, `NotificationPanel`, `PredictionTemplate`
- **Decision**: Document findings only. Do NOT delete anything. User will review and decide later.
- **Rationale**: Safe approach — lets user evaluate whether each component is planned for future use.

### Import path style — Standardize to barrel imports
- **46 files**, **38 unique component patterns** use `@atoms/Name/Name` duplicate-path style
- **Decision**: Replace all with barrel imports (`@atoms/Name`) for consistency with codebase convention
- **Scope**: atoms (11), molecules (16), organisms (11)

### React import removal — Batch remove all 40
- **40 TSX files** have `import React from 'react'` which is unnecessary in React 19
- **Decision**: Bulk remove from all files

### Broken imports
- **Checking method**: `pnpm build` and `pnpm test:run` pass. Verified no `Typrography`-style typos via grep. No broken imports found.

## Scope Summary
| Work item | Files affected | Effort |
|---|---|---|
| Barrel import standardization | 46 files | Medium (sed + lint) |
| React import removal | 40 files | Low (simple grep-sed) |
| Dead component analysis | 6 components (document only) | Low |
| Verification | lint + test:run + build | — |
