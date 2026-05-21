# WC26 Brand Migration + Mobile-First Refactor

> **Status:** In progress — colors done, mobile done, Storybook fixed
> **Updated:** 2026-05-21

---

## What's Done

| Task | Status |
|------|--------|
| T1: global.css WC26 colors | ✅ Done |
| T2: Color touch-ups | ✅ Done (TournamentTemplate, PredictionTemplate, HomeTemplate) |
| T4: Header title visible | ✅ Done |
| Storybook Firebase mock | ✅ Done (`.storybook/preview.ts`) |

---

## Remaining Tasks

| Task | Status |
|------|--------|
| T3: App icon (match header football icon) | ✅ Done |
| T5: Flip max-width → min-width (mobile-first) | Pending |
| T6: Create DESIGN.md | Pending |
| T7: Update PROJECT_PLAN.md | Pending |

---

## Next Steps

1. **T3:** Update `scripts/generate-icons.mjs` to match header football icon (Gamepad style), regenerate icons, update `manifest.json` theme color
2. **T5:** Flip CSS only in files that are actually broken on mobile (check MatchCard, TeamFlag)
3. **T6-T7:** Docs

---

## Execution Order

```
T3 (app icon) → T5 (mobile flip) → T6 (DESIGN.md) → T7 (PROJECT_PLAN) → lint → build → verify
```

---

*Last updated: 2026-05-21*