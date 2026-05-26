# driver.js Spike Results

## Installation
- Version installed: 1.4.0
- Bundle size: 27KB minified JS + 3.8KB CSS = 30.8KB total
- Gzipped size: ~6.9KB JS + ~1.1KB CSS = **~8KB gzipped**
- Dependencies: 0 (verified — zero dependencies)
- License: MIT
- Weekly npm downloads: ~70M+ (widely adopted)

## CSP Compatibility
- CSP header in firebase.json: `style-src 'self' 'unsafe-inline'` — already permissive
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — also permissive
- driver.js behavior: uses `element.style.*` for inline positioning styles, `innerHTML` for button content. Does NOT use `eval()`.
- CSP violation found: **no** — existing policy already allows inline styles and scripts
- No changes needed to CSP

## Popover Styling
- Can popover background/typography be overridden? **yes**
- Override mechanism: CSS class overrides via `popoverClass` config option
- Key CSS classes driver.js uses for popover:
  - `.driver-popover` — main popover container
  - `.driver-popover-title` — heading
  - `.driver-popover-description` — body text
  - `.driver-popover-prev-btn`, `.driver-popover-next-btn` — navigation buttons
  - `.driver-popover-close-btn` — close button
  - `.driver-popover-progress-text` — progress indicator
  - `.driver-popover-footer` — action bar
  - `.driver-popover-arrow` — directional arrow
  - `.driver-highlighted-element` — highlighted element outline
  - `.driver-overlay` — dark backdrop
- Pixel-art styling is fully feasible — all properties can be overridden with `!important` or higher specificity

## Element Targeting
- Can driver.js find elements by CSS selector? **yes** — uses `document.querySelector()`
- Works with View Transitions? **needs testing** — driver.js attaches to DOM elements; if elements are replaced during navigation, the tour may lose its target. Recommendation: start tours after page load, not during transitions.
- Works inside React islands? **yes** — driver.js queries the live DOM, so it works with React-rendered elements as long as they exist when the tour step is reached

## Bundle Impact
- driver.js is tree-shakeable via ESM imports
- Only pages that import `ProductTour` will include driver.js in their bundle
- Estimated impact on predictions page: +8KB gzipped (~1.5% of current ~542KB total JS)
- Acceptable tradeoff for guided onboarding

## Conclusion
- **Recommended for integration: YES**
- Blockers found: **none**
- Notes:
  - CSP is already compatible — no changes needed
  - Pixel-art styling is fully achievable with CSS overrides
  - Bundle impact is minimal (~8KB gzipped)
  - driver.js is well-maintained (MIT, zero deps, 70M+ weekly downloads)
  - Works with React islands and Astro static rendering
  - Caveat: avoid starting tours during View Transitions; trigger after page load
