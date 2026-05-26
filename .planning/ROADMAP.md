
### Phase 1: Frontend UX improvements and responsive design fixes

**Goal:** Fix mobile UX issues, improve responsive layout, and enhance accessibility across the prediction flow

**Requirements**:
- Team names: show full name when space allows, fallback to FIFA code (3 letters) when truncated
- Mobile select dropdowns: proper sizing and positioning
- Back/Next buttons: match design system style with rounded pixelated corners (stepped edges, not smooth curves)
- Progress indicator: compact on mobile to reduce scrolling
- Bug: "Best Players" incorrectly marked as submitted after completing Group A
- Bug: TeamSelector shows empty after selecting a team
- Use rem units for font-size to respect user preferences
- Visual: make page more vibrant with tournament colors (currently feels boring)
- Visual: show tournament name prominently
- Mobile menu: clear visual separation from page behind (backdrop/overlay)
- Mobile menu: "Hacer Predicciones" button repositioned (not sandwiched between nav items)
- Mobile menu: display user's displayName (not email)
- Mobile menu: logout button more visible/prominent
- Mobile menu: active/highlighted option more prominent
- PWA: add visible install prompt/button
- Spinner: redesign to match pixel-art style (currently looks like spinning square)
- Mobile: eliminate horizontal scrolling completely
- PWA: implement cache-busting/version update mechanism to fetch latest site
- Predictor list UX: clarify row click vs edit button (row = edit predictions, button = edit name/avatar)
- Predictor list: make Edit/Delete buttons more visible with pixel-art icons
- Documentation: update README.md, DESIGN.md, and AGENTS.md to reflect current state and Phase 1 changes

**Plans:** 9 plans in 8 waves

Plans:
- [x] 01-01-PLAN.md — CSS rem migration, horizontal scroll fix, PWA manifest id
- [x] 01-02-PLAN.md — Bug fixes: Best Players false submission, TeamSelector empty selection
- [x] 01-03-PLAN.md — Component improvements: pixelated buttons, pixel-art spinner, responsive team names
- [x] 01-04-PLAN.md — Mobile UX: compact progress indicator, select dropdown sizing
- [x] 01-05-PLAN.md — Mobile menu: backdrop overlay, CTA repositioning, displayName, logout, active links, tournament name
- [x] 01-06-PLAN.md — Predictor list UX: row click clarity, pixel-art icons
- [x] 01-07-PLAN.md — PWA: install prompt component, cache-busting version update
- [x] 01-08-PLAN.md — Visual polish: WC26 tournament gradients
- [x] 01-09-PLAN.md — Documentation: README, DESIGN, AGENTS updates
