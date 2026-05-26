# Phase 1 — Plan Quality Check

## Overall Verdict: NEEDS REVISION

**Plans checked:** 9
**Issues:** 1 blocker(s), 6 warning(s), 2 info

---

## Per-Plan Results

### Plan 01-01: CSS rem migration, horizontal scroll fix, PWA manifest id
- [x] Frontmatter valid (partial — `files_modified` incomplete)
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered (partial — REQ-21 misattributed)
- [x] dependencies logical
- [x] wave assignment correct
**Issues:**
- **WARNING [task_completeness]:** `files_modified` lists only `global.css` and `manifest.json`, but tasks actually modify 4 additional files: `TeamFlag.css`, `PredictionsTemplate.css`, `NavBar.css`, `PredictionForm.css`. Downstream dependency analysis may miss file conflicts.
- **WARNING [requirement_coverage]:** Plan claims REQ-21 (documentation) in requirements frontmatter, but no documentation task exists in this plan. REQ-21 is properly covered by Plan 09 — this is a frontmatter inaccuracy, not a coverage gap.

### Plan 01-02: Bug fixes — Best Players false submission, TeamSelector empty selection
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered
- [x] dependencies logical
- [x] wave assignment correct
**Issues:** None. Excellent plan with precise root cause analysis, exact line references, and concrete fix instructions.

### Plan 01-03: Component improvements — pixelated buttons, pixel-art spinner, responsive team names
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered
- [x] dependencies logical
- [x] wave assignment correct
**Issues:** None. All three tasks have exact CSS values (clip-path polygons, drop-shadow values, container query breakpoints).

### Plan 01-04: Mobile UX — compact progress indicator, select dropdown sizing
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered (partial — REQ-23 phantom)
- [ ] dependencies logical (missing dependency on 01-03)
- [x] wave assignment correct
**Issues:**
- **WARNING [requirement_coverage]:** Plan claims REQ-23 in requirements frontmatter. No REQ-23 exists in ROADMAP.md (21 requirements total). Phantom requirement ID.
- **WARNING [dependency_correctness]:** Task 1 action says "Apply the same clip-path polygon from Button.css for pixelated corners" — this clip-path pattern is created by Plan 03 Task 1. Plan 04 depends on [01-01, 01-02] but NOT 01-03. Wave assignment (Wave 4 > Wave 3) prevents parallel execution, but `depends_on` is incomplete. If executor uses dependency-based parallelization instead of wave-based, Plan 04 could run before Plan 03.

### Plan 01-05: Mobile menu — backdrop overlay, CTA repositioning, displayName, logout, active links, tournament name
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered
- [x] dependencies logical
- [x] wave assignment correct
**Issues:** None. Task 2 covers 4 requirements (REQ-11 through REQ-14) in one task, but all target the same files (NavBar.tsx, NavBar.css) so splitting would create conflicts. Acceptable density.

### Plan 01-06: Predictor list UX — row click clarity, pixel-art icons
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered
- [x] dependencies logical
- [x] wave assignment correct
**Issues:** None.

### Plan 01-07: PWA — install prompt component, cache-busting version update
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered
- [x] dependencies logical
- [x] wave assignment correct
**Issues:**
- **WARNING [key_links_planned]:** Task 1 creates `PWAInstall.tsx` component but says "The component should be imported and rendered in the app's root layout or a common shell component (e.g., BaseLayout.astro's client:load island or the main App component)." The mount point file is NOT in the `<files>` list and NOT specified concretely. Component will be created but may never be mounted — dead code risk. Executor needs to know exactly which file to add the import to.

### Plan 01-08: Visual polish — WC26 tournament gradients
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered
- [x] dependencies logical
- [x] wave assignment correct
**Issues:** None. Single-task plan with clear gradient application instructions.

### Plan 01-09: Documentation — README, DESIGN, AGENTS updates
- [x] Frontmatter valid
- [x] Tasks specific
- [x] read_first populated
- [x] acceptance_criteria verifiable
- [x] action concrete
- [x] requirements covered
- [x] dependencies logical
- [x] wave assignment correct
**Issues:** None. Appropriate for documentation tasks — verify commands check keyword presence which is sufficient for content verification.

---

## Requirement Coverage

| Req ID | Description | Covered | Plan | Notes |
|--------|-------------|---------|------|-------|
| REQ-01 | Team names responsive | Yes | 03 | Container queries + FIFA code fallback |
| REQ-02 | Mobile select dropdowns | Yes | 04 | Touch target sizing + pixel-art styling |
| REQ-03 | Pixelated button corners | Yes | 03 | clip-path polygon on .btn |
| REQ-04 | Compact progress indicator | Yes | 04 | Mobile media query hides labels |
| REQ-05 | Best Players bug | Yes | 02 | Dynamic step index calculation |
| REQ-06 | TeamSelector bug | Yes | 02 | React.useId() for unique radio names |
| REQ-07 | rem font-size migration | Yes | 01 | Replace hardcoded px with var(--text-*) |
| REQ-08 | Vibrant tournament colors | Yes | 08 | WC26 gradient application |
| REQ-09 | Tournament name prominent | Yes | 05 | "FIFA World Cup 2026" subtitle |
| REQ-10 | Mobile menu backdrop | Yes | 05 | ::before overlay with blur |
| REQ-11 | CTA repositioned | Yes | 05 | Moved to top of mobile menu |
| REQ-12 | displayName display | Yes | 05 | Verified existing userDisplayName usage |
| REQ-13 | Logout prominent | Yes | 05 | Danger button styling |
| REQ-14 | Active link prominent | Yes | 05 | Background + left border accent |
| REQ-15 | PWA install prompt | Yes | 07 | beforeinstallprompt + custom button |
| REQ-16 | Spinner pixel-art | Yes | 03 | clip-path + steps(8) animation |
| REQ-17 | No horizontal scroll | Yes | 01 | Global overflow prevention + grid fix |
| REQ-18 | Cache-busting | Yes | 07 | CACHE_NAME v5 + SKIP_WAITING |
| REQ-19 | Row click clarity | Yes | 06 | Aria-labels + "Edit Profile" text |
| REQ-20 | Pixel-art icons | Yes | 06 | Icon component or pixelarticons classes |
| REQ-21 | Documentation | Yes | 09 | README, DESIGN, AGENTS updates |

**Coverage: 21/21 requirements covered.** No gaps.

---

## Dependency Graph

```
Wave 1: 01-01 (foundation: rem, scroll, manifest)
Wave 2: 01-02 (bug fixes) ← 01-01
Wave 3: 01-03 (components) ← 01-01
Wave 4: 01-04 (mobile UX) ← 01-01, 01-02
Wave 5: 01-05 (mobile menu) ← 01-01
Wave 6: 01-06 (predictor list) ← 01-01, 01-03
Wave 7: 01-07 (PWA) ← 01-01
Wave 7: 01-08 (gradients) ← 01-01, 01-03
Wave 8: 01-09 (docs) ← all
```

No cycles. All references valid. Waves 7 has two plans (07, 08) with no file overlap. ✓

---

## Dimension 7c: Architectural Tier Compliance

All capabilities assigned to Browser/Client tier per RESEARCH.md Architectural Responsibility Map. All plan tasks target Browser/Client tier (CSS, React components, service worker). No tier mismatches. ✓

---

## Dimension 8: Nyquist Compliance

| Task | Plan | Wave | Automated Command | Status |
|------|------|------|-------------------|--------|
| 01-01-01 | 01 | 1 | `grep ... && pnpm test:run` | ✅ |
| 01-01-02 | 01 | 1 | `pnpm build` | ✅ |
| 01-01-03 | 01 | 1 | `node -e "..."` | ✅ |
| 01-02-01 | 02 | 2 | `grep ... && pnpm test:run` | ✅ |
| 01-02-02 | 02 | 2 | `grep ... && pnpm test:run` | ✅ |
| 01-03-01 | 03 | 3 | `grep ... && pnpm test:run` | ✅ |
| 01-03-02 | 03 | 3 | `grep ... && pnpm test:run` | ✅ |
| 01-03-03 | 03 | 3 | `grep ... && pnpm test:run` | ✅ |
| 01-04-01 | 04 | 4 | `grep ... && pnpm build` | ✅ |
| 01-04-02 | 04 | 4 | `grep ... && pnpm build` | ✅ |
| 01-05-01 | 05 | 5 | `grep ... && pnpm build` | ✅ |
| 01-05-02 | 05 | 5 | `grep ... && pnpm build` | ✅ |
| 01-05-03 | 05 | 5 | `grep ... && pnpm build` | ✅ |
| 01-06-01 | 06 | 6 | `grep ... && pnpm test:run` | ✅ |
| 01-06-02 | 06 | 6 | `grep ... && pnpm test:run` | ✅ |
| 01-07-01 | 07 | 7 | `grep ... && pnpm build` | ✅ |
| 01-07-02 | 07 | 7 | `grep ... && pnpm build` | ✅ |
| 01-08-01 | 08 | 7 | `grep ... && pnpm build` | ✅ |
| 01-09-01 | 09 | 8 | `grep ...` | ✅ |
| 01-09-02 | 09 | 8 | `grep ...` | ✅ |
| 01-09-03 | 09 | 8 | `grep ...` | ✅ |

**Sampling:** All waves have ≥2/3 tasks with automated verify. No 3 consecutive tasks without automated. ✅
**Wave 0:** No MISSING references. ✅
**Feedback latency:** All commands < 30s. No watch mode. ✅
**Overall: ✅ PASS**

---

## Dimension 9: Cross-Plan Data Contracts

Shared files across plans (all sequential via dependencies):
- `global.css`: Plan 01 (overflow rules) → Plan 08 (gradient utilities). Different sections. ✓
- `PredictionsTemplate.css`: Plan 01 (rem) → Plan 04 (compact) → Plan 08 (gradients). All sequential. ✓
- `NavBar.css`: Plan 01 (badge rem) → Plan 05 (mobile menu). Sequential. ✓
- `TeamFlag.css`: Plan 01 (rem) → Plan 03 (container queries). Sequential. ✓

No conflicting transforms on shared data. ✓

---

## Dimension 10: AGENTS.md Compliance

- CSS variables used throughout (no Tailwind). ✓
- Atomic Design: PWAInstall at @organisms/. ✓
- Pixel-art aesthetic: clip-path, steps() animation, pixel font. ✓
- Zero-JS default: PWAInstall is appropriate React island for interactive PWA feature. ✓
- Vitest for testing. ✓
- No middleware added. ✓

**WARNING:** Plans 04, 05, 07, 08 use `pnpm build` as sole verify command without `pnpm test:run`. AGENTS.md specifies verification order as "lint → test:run → build" implying all three should run. For CSS-only changes this may be acceptable, but the plans don't justify the omission.

---

## Dimension 11: Research Resolution

**BLOCKER:** RESEARCH.md `## Open Questions` section (line 417) is NOT marked `(RESOLVED)`. Four questions listed without inline `RESOLVED` markers:

1. **Minimum viewport width** — Has recommendation ("Assume 320px minimum") implemented by Plan 01, but not marked RESOLVED
2. **PWA install prompt frequency** — Has recommendation ("Store dismissal in localStorage") implemented by Plan 07, but not marked RESOLVED
3. **Tournament name** — Has recommendation ("FIFA World Cup 2026") implemented by Plan 05, but not marked RESOLVED
4. **Spinner CSS vs SVG** — Has recommendation ("CSS-only with clip-path") implemented by Plan 03, but not marked RESOLVED

The plans correctly implement all recommendations, but RESEARCH.md format does not comply. Trivially fixable by updating the section heading to `## Open Questions (RESOLVED)` and adding `RESOLVED:` prefix to each question's recommendation.

---

## Dimension 12: Pattern Compliance

SKIPPED (no PATTERNS.md found)

---

## Structured Issues

```yaml
issues:
  - plan: null
    dimension: research_resolution
    severity: blocker
    description: "RESEARCH.md has 4 open questions without RESOLVED markers. Section heading is '## Open Questions' not '## Open Questions (RESOLVED)'."
    file: "01-RESEARCH.md"
    unresolved_questions:
      - "What is the minimum viewport width to support?"
      - "Should the PWA install prompt be shown on every visit or only once?"
      - "What tournament name should be displayed prominently?"
      - "Should the pixel-art spinner use CSS-only or SVG frames?"
    fix_hint: "Update section heading to '## Open Questions (RESOLVED)' and add 'RESOLVED:' prefix with implementation reference to each question"

  - plan: "01"
    dimension: task_completeness
    severity: warning
    description: "files_modified frontmatter lists only 2 files (global.css, manifest.json) but tasks actually modify 6 files total"
    missing_files:
      - "src/components/molecules/TeamFlag/TeamFlag.css"
      - "src/components/templates/PredictionsTemplate/PredictionsTemplate.css"
      - "src/components/organisms/NavBar/NavBar.css"
      - "src/components/organisms/PredictionForm/PredictionForm.css"
    fix_hint: "Add all 4 missing files to files_modified frontmatter"

  - plan: "01"
    dimension: requirement_coverage
    severity: warning
    description: "Plan claims REQ-21 (documentation) in requirements frontmatter but has no documentation task"
    fix_hint: "Remove REQ-21 from Plan 01 requirements field — it belongs to Plan 09 only"

  - plan: "04"
    dimension: requirement_coverage
    severity: warning
    description: "Plan claims REQ-23 in requirements frontmatter but no REQ-23 exists in ROADMAP.md (21 requirements total)"
    fix_hint: "Remove REQ-23 from Plan 04 requirements field. If this was meant to be REQ-17 (horizontal scroll verification), add REQ-17 instead"

  - plan: "04"
    dimension: dependency_correctness
    severity: warning
    description: "Task 1 references 'Apply the same clip-path polygon from Button.css' which is created by Plan 03, but depends_on does not include 01-03"
    fix_hint: "Add '01-03' to Plan 04 depends_on list, or rephrase action to define the clip-path value inline rather than referencing Button.css"

  - plan: "07"
    dimension: key_links_planned
    severity: warning
    description: "PWAInstall component created but mount point not specified — plan says 'root layout or common shell component' without naming the file"
    fix_hint: "Specify exact mount point file (e.g., src/layouts/BaseLayout.astro or a PredictionsLayout wrapper) and add it to files list with import statement in action"

  - plan: "04,05,07,08"
    dimension: claude_md_compliance
    severity: warning
    description: "Verify commands use only pnpm build, skipping pnpm test:run which AGENTS.md includes in verification order"
    fix_hint: "Add '&& pnpm test:run' to verify commands in CSS-only plans, or document in plan rationale why test:run is skipped for CSS-only changes"
```

---

## Plan Summary

| Plan | Tasks | Files | Wave | Status |
|------|-------|-------|------|--------|
| 01   | 3     | 6*    | 1    | Valid (frontmatter incomplete) |
| 02   | 2     | 3     | 2    | Valid |
| 03   | 3     | 5     | 3    | Valid |
| 04   | 2     | 4     | 4    | Valid (missing dep, phantom req) |
| 05   | 3     | 2     | 5    | Valid |
| 06   | 2     | 2     | 6    | Valid |
| 07   | 2     | 3     | 7    | Valid (mount point unspecified) |
| 08   | 1     | 2     | 7    | Valid |
| 09   | 3     | 3     | 8    | Valid |

*Plan 01 files_modified says 2, actual is 6.

---

## Recommendations

### Must Fix (Blocker)

1. **Resolve RESEARCH.md open questions** — Update section heading to `## Open Questions (RESOLVED)` and add `RESOLVED:` markers to each question. This is a 2-minute edit that unblocks the verification gate.

### Should Fix (Warnings)

2. **Plan 01: Fix files_modified** — Add the 4 missing files to the frontmatter so dependency analysis is accurate.

3. **Plan 04: Add dependency on 01-03** — The clip-path reference requires Plan 03 to be complete. Add `01-03` to `depends_on`.

4. **Plan 04: Remove phantom REQ-23** — No such requirement exists. Remove from frontmatter.

5. **Plan 01: Remove REQ-21** — Documentation is Plan 09's responsibility. Remove from Plan 01 requirements field.

6. **Plan 07: Specify PWAInstall mount point** — Name the exact file where PWAInstall will be imported and rendered (e.g., `src/layouts/BaseLayout.astro` as a `client:load` island). Add that file to `<files>` and add the import/render to Task 1's `<action>`.

### Nice to Have (Info)

7. **Consider adding `pnpm test:run` to CSS-only plan verify commands** — While CSS changes are unlikely to break unit tests, running the full suite catches regressions from CSS class name changes that affect test selectors.

8. **Wave optimization** — Plans 05, 06, 07 could potentially run in parallel (Wave 5) since they don't share files and all depend only on Wave 1-3 plans. Current conservative wave assignment (5, 6, 7) serializes them unnecessarily. Not blocking — just slower execution.
