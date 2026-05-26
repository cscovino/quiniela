# Phase 9 Discussion Log

## 2026-05-27 — Codebase scout + gray area resolution

### Present: User, Claude (discuss-phase)

### Codebase Scout Results
- **6 Storybook-only components** with zero app imports: AuthGuard, DesignTokens, ScoreDisplay, KnockoutBracketForm, NotificationPanel, PredictionTemplate
- **46 files** (38 unique components) using duplicate-path import style `@atoms/Name/Name`
- **40 TSX files** with unnecessary `import React from 'react'` (React 19 auto-JSX)
- **No broken imports** — build, lint, and tests all pass clean

### Gray Area 1: Dead component removal
- **Question**: Which components to delete vs keep?
- **User's choice**: Analysis only, no deletions now
- **Rationale**: User wants to review findings before any deletions. Safer approach.

### Gray Area 2: Import path style
- **Question**: Standardize to barrel imports (`@atoms/Name`) or keep duplicate path?
- **User's choice**: Standardize to barrel imports
- **Scope**: 46 files, 38 unique component paths (11 atoms, 16 molecules, 11 organisms)

### Gray Area 3: React import removal
- **Question**: Batch remove all 40 or defer?
- **User's choice**: Batch remove all 40
- **Scope**: 40 TSX files across src/

### Next Steps
1. Run `/gsd-plan-phase 9` to break into executable plans
2. Execute barrel import standardization + React import removal in waves
3. Verification: lint → test:run → build
