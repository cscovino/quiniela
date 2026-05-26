---
phase: 1
slug: refactor-design-system-to-use-rem-units-for-font-size-and-ot
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test:run` |
| **Full suite command** | `pnpm test:run` |
| **Estimated runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:run`
- **After every plan wave:** Run `pnpm test:run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~12 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | REQ-07 | — | rem-based font sizes render correctly | unit | `pnpm test:run` | ✅ | ⬜ pending |
| 01-02-01 | 01 | 1 | REQ-01 | — | Team names display correctly (full or FIFA code) | unit | `pnpm test:run` | ✅ | ⬜ pending |
| 01-03-01 | 01 | 2 | REQ-03 | — | Buttons have pixelated rounded corners | visual | `pnpm build` | ✅ | ⬜ pending |
| 01-04-01 | 01 | 2 | REQ-16 | — | Spinner matches pixel-art style | visual | `pnpm build` | ✅ | ⬜ pending |
| 01-05-01 | 01 | 3 | REQ-06 | T-01-01 | TeamSelector shows selected value | unit | `pnpm test:run` | ✅ | ⬜ pending |
| 01-06-01 | 01 | 3 | REQ-05 | T-01-02 | Best Players step not marked submitted prematurely | unit | `pnpm test:run` | ✅ |  pending |
| 01-07-01 | 01 | 4 | REQ-02 | — | Mobile select dropdowns sized/positioned correctly | visual | `pnpm build` | ✅ | ⬜ pending |
| 01-08-01 | 01 | 4 | REQ-04 | — | Progress indicator compact on mobile | visual | `pnpm build` | ✅ | ⬜ pending |
| 01-09-01 | 01 | 5 | REQ-10-14 | — | Mobile menu UX improvements | visual | `pnpm build` | ✅ | ⬜ pending |
| 01-10-01 | 01 | 5 | REQ-19-20 | — | Predictor list UX improvements | unit | `pnpm test:run` | ✅ |  pending |
| 01-11-01 | 01 | 6 | REQ-15 | — | PWA install prompt visible and functional | manual | — | ✅ | ⬜ pending |
| 01-12-01 | 01 | 6 | REQ-17 | — | No horizontal scrolling on mobile | visual | `pnpm build` | ✅ | ⬜ pending |
| 01-13-01 | 01 | 6 | REQ-18 | — | Cache-busting/version update works | manual | — | ✅ | ⬜ pending |
| 01-14-01 | 01 | 7 | REQ-08-09 | — | Vibrant tournament colors and name display | visual | `pnpm build` | ✅ | ⬜ pending |
| 01-15-01 | 01 | 7 | REQ-21 | — | Documentation updated | manual | — | ✅ |  pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.
- Vitest config already set up with 77 test files, 427 tests.
- No new test files needed for Wave 0.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PWA install prompt triggers correctly | REQ-15 | Requires browser install flow | Open in Chrome, check install prompt appears |
| Cache-busting fetches latest site | REQ-18 | Requires service worker update cycle | Deploy, clear cache, verify new version loads |
| Mobile menu backdrop/overlay visual | REQ-10 | Visual verification on mobile | Open menu on mobile, check backdrop |
| Horizontal scrolling eliminated | REQ-17 | Visual verification on small screens | Test on 320px viewport, check no horizontal scroll |
| Tournament colors vibrant | REQ-08 | Subjective visual assessment | Compare before/after screenshots |
| Documentation accuracy | REQ-21 | Content verification | Read README, DESIGN, AGENTS for accuracy |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
