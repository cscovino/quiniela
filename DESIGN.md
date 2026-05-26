---
version: alpha
name: Quiniela WC26
description: Retro pixel art football prediction app themed for FIFA World Cup 2026. Mobile-first, WC26 brand-compliant, zero CSS dependencies.
colors:
  primary: "#0a0a0a"
  primary-100: "#2a2a2a"
  primary-200: "#222222"
  primary-300: "#1a1a1a"
  primary-400: "#111111"
  primary-500: "#0a0a0a"
  primary-600: "#050505"
  primary-700: "#030303"
  primary-800: "#020202"
  primary-900: "#000000"
  accent: "#1D3557"
  accent-100: "#1a2a40"
  accent-200: "#1f334d"
  accent-300: "#243c5a"
  accent-400: "#294567"
  accent-500: "#1D3557"
  accent-600: "#162a42"
  accent-700: "#0f1f32"
  accent-800: "#081422"
  accent-900: "#020811"
  secondary: "#E63946"
  secondary-500: "#E63946"
  tertiary: "#2D6A4F"
  tertiary-500: "#2D6A4F"
  vibrant: "#06D6A0"
  vibrant-500: "#06D6A0"
  warm: "#F4A261"
  warm-500: "#F4A261"
  gold: "#D4AF37"
  gold-500: "#D4AF37"
  success: "#2D6A4F"
  error: "#E63946"
  warning: "#F4A261"
  info: "#1D3557"
typography:
  heading-xl:
    fontFamily: "Press Start 2P"
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.25
  heading-lg:
    fontFamily: "Press Start 2P"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.25
  heading-md:
    fontFamily: "Press Start 2P"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.25
  heading-sm:
    fontFamily: "Press Start 2P"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.25
  heading-xs:
    fontFamily: "Press Start 2P"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.25
  text-3xl:
    fontFamily: "Inter"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
  text-2xl:
    fontFamily: "Inter"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  text-xl:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.5
  text-lg:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
  text-base:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  text-sm:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  text-xs:
    fontFamily: "Inter"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0px
spacing:
  space-0: 0px
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-5: 20px
  space-6: 24px
  space-8: 32px
  space-10: 40px
  space-12: 48px
  space-16: 64px
  space-20: 80px
  space-24: 96px
components:
  button-primary:
    backgroundColor: "{colors.accent-500}"
    textColor: "#ffffff"
    typography: "{typography.text-sm}"
    rounded: "{rounded.none}"
    padding: "{spacing.space-3}"
    border: "4px solid {colors.accent-500}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.accent-500}"
    typography: "{typography.text-sm}"
    rounded: "{rounded.none}"
    padding: "{spacing.space-3}"
    border: "4px solid {colors.accent-500}"
  input:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.primary-900}"
    typography: "{typography.text-base}"
    rounded: "{rounded.none}"
    padding: "{spacing.space-3}"
    border: "4px solid {colors.accent-500}"
  card:
    backgroundColor: "{colors.primary-400}"
    textColor: "{colors.primary-900}"
    rounded: "{rounded.none}"
    padding: "{spacing.space-4}"
    border: "4px solid {colors.accent-500}"
    shadow: "4px 4px 0px {colors.primary-700}"
---

## Overview

Retro pixel art football prediction app themed for FIFA World Cup 2026. Sharp corners, blocky shadows, 4px borders. Mobile-first responsive design with WC26 official brand colors.

**Design principles:**
- Pixel art aesthetic — no border-radius, no blur shadows
- Mobile-first — base styles target 320px+, breakpoints scale up
- WC26 brand — official 7-color palette (black primary + vibrant accents)
- Zero CSS dependencies — CSS variables, no Tailwind, no CSS-in-JS

## Colors

The WC26 official palette uses black as the primary color with seven vibrant accents representing the host nations and tournament energy.

- **Primary (#0a0a0a):** Deep black for backgrounds and text
- **Accent (#1D3557):** Deep blue for links, active states, borders
- **Secondary (#E63946):** Red — Canada energy, error states
- **Tertiary (#2D6A4F):** Green — Mexico energy, success states
- **Vibrant (#06D6A0):** Teal — USA energy, highlights
- **Warm (#F4A261):** Orange — warning states, warm accents
- **Gold (#D4AF37):** Trophies, rankings, celebration

Each color has a 9-step scale (`-100` lightest → `-900` darkest) for tonal variations.

**Semantic colors:**
- `--color-success`: Green `#2D6A4F`
- `--color-error`: Red `#E63946`
- `--color-warning`: Orange `#F4A261`
- `--color-info`: Blue `#1D3557`

**Theming:** Toggle via `data-theme` on `<html>`. Light theme uses white cards on light gray background with inverted text colors.

## Typography

Two font families create the pixel-meets-modern aesthetic:

- **Press Start 2P (400):** Headings, labels, pixel art text. Retro gaming feel.
- **Inter (400–700):** Body text, descriptions. Modern readability.

### rem Typography Scale (WCAG 2.2 Compliance)

All font-sizes use `rem` units via CSS variables in `src/styles/global.css`. This ensures accessibility compliance and consistent scaling across the app.

| Variable | rem Value | Pixel Equivalent | Usage |
|----------|-----------|------------------|-------|
| `--text-xs` | 0.625rem | 10px | Small badges, timestamps |
| `--text-sm` | 0.75rem | 12px | Secondary text, labels |
| `--text-base` | 0.875rem | 14px | Body text, inputs |
| `--text-lg` | 1rem | 16px | Emphasized text |
| `--text-xl` | 1.125rem | 18px | Section labels |
| `--text-2xl` | 1.5rem | 24px | Subtitles |
| `--text-3xl` | 2rem | 32px | Page titles |
| `--text-4xl` | 2.5rem | 40px | Hero headings |
| `--heading-xs` | 1rem | 16px | Small pixel headings |
| `--heading-sm` | 1.25rem | 20px | Medium pixel headings |
| `--heading-md` | 1.5rem | 24px | Standard pixel headings |
| `--heading-lg` | 2rem | 32px | Large pixel headings |
| `--heading-xl` | 2.5rem | 40px | XL pixel headings |

**Heading scale:** `heading-xs` (1rem) → `heading-xl` (2.5rem), all Press Start 2P
**Text scale:** `text-xs` (0.625rem) → `text-3xl` (2rem), all Inter

**No hardcoded `px` font-sizes** — all typography uses CSS variables for consistency and accessibility.

## Layout

Mobile-first responsive strategy with two breakpoints:

- **320px+ (base):** Single column, stacked layouts, hamburger nav, full-width buttons
- **480px+ (`--breakpoint-sm`):** Increased padding, wider team names, larger fonts
- **1024px+ (`--breakpoint-md`):** Multi-column, horizontal nav, full desktop layouts

**Spacing scale:** 4px grid system. All values multiples of 4 (`space-1` = 4px through `space-24` = 96px).

**Container:** Max-width 960px for content areas, centered with `margin: 0 auto`.

## Elevation & Depth

Depth achieved through blocky shadows with no blur — pure pixel art style:

- **`--shadow-sm`:** `2px 2px 0px` offset
- **`--shadow-md`:** `4px 4px 0px` offset
- **`--shadow-lg`:** `6px 6px 0px` offset

Light theme uses lighter shadow colors. Cards sit on page background with visible shadow offset creating layered effect.

## Shapes

Sharp corners only. Zero `border-radius` across all elements. This is a core design principle — every rectangle, button, card, and input has crisp 90-degree corners matching the pixel art aesthetic.

### Pixel-Art Corner Technique

For components requiring stepped/pixelated corners (buttons, badges), use `clip-path` with polygon coordinates:

```css
.pixel-corners {
  clip-path: polygon(
    0px 4px, 4px 4px, 4px 0px,
    calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%,
    4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px)
  );
}
```

**Important:** When using `clip-path`, replace `box-shadow` with `filter: drop-shadow()` since clip-path clips box-shadow as well.

### Pixel-Art Spinner

The Spinner component uses `clip-path` to create an 8-segment pixel circle with `steps(8)` animation:

```css
.spinner--pixel {
  clip-path: polygon(...); /* 8-segment approximation */
  animation: spin 0.8s steps(8) infinite;
}
```

### Container Queries for Responsive Components

TeamFlag uses CSS container queries for responsive content display:

```css
.team-flag {
  container-type: inline-size;
}

@container (max-width: 48px) {
  .team-flag__name { display: none; }
  .team-flag__fifa { display: block; }
}
```

This pattern allows components to adapt based on their container width rather than viewport width — ideal for flexible grid layouts.

## WC26 Gradient Tokens

Brand gradients for page headers, section dividers, and accent elements:

| Token | Colors | Usage |
|-------|--------|-------|
| `--gradient-wc26-energy` | Red → Orange → Teal | Page h1, primary CTAs |
| `--gradient-wc26-trophy` | Gold → Warm | Section borders, rankings |
| `--gradient-wc26-hosts` | Blue → Green → Red | Host nation accents |

**Gradient text pattern:**
```css
.text-gradient-energy {
  background: var(--gradient-wc26-energy);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

**Gradient border pattern:**
```css
.section-header {
  border-image: var(--gradient-wc26-trophy) 1;
}
```

## PWA Design

### Install Prompt Component

The `PWAInstall` component (`src/components/organisms/PWAInstall/`) handles the `beforeinstallprompt` event:

1. Listens for `beforeinstallprompt` event on mount
2. Stores the event for deferred prompting
3. Shows a pixel-art styled banner with "Install App" and "Enable Notifications" CTAs
4. Persists dismissal state in `localStorage` (`pwa-install-dismissed`)
5. Calls `prompt()` on user interaction

### Service Worker Cache Versioning

Cache version is controlled by `CACHE_NAME` in `public/sw.js`:
- Bump version on each deploy: `const CACHE_NAME = 'quiniela-v5';`
- Old caches deleted in `activate` event
- `SKIP_WAITING` message handler for forced updates

### Manifest Configuration

`public/manifest.json` includes:
- `"id": "/"` for Chrome 121+ PWA compatibility
- `shortcuts` for quick actions (Predictions, Rankings)
- `screenshots` for install prompt

## Mobile Menu Pattern

The NavBar mobile menu uses a CSS `::before` pseudo-element for the backdrop overlay:

```css
.nav-bar__menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  z-index: 100;
}

.nav-bar__menu::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: -1;
}
```

**Key features:**
- Backdrop covers full viewport with blur effect
- CTA button repositioned to menu bottom on mobile
- Active nav links highlighted with accent background
- Tournament name displayed in footer

## Components

**Atomic Design structure:**
- **Atoms:** Button, Input, Icon, Badge, Avatar, Spinner, Typography, Tooltip, ProgressBar, Divider, Checkbox, Radio
- **Molecules:** MatchCard, TeamFlag, PredictorSelector, GroupStandings
- **Organisms:** NavBar, Footer, ToastProvider
- **Templates:** PredictionsTemplate, ProfileTemplate, AuthTemplate

**Naming convention:** BEM with double underscore (`.block__element--modifier`)

**Key patterns:**
- MatchCard: Teams stack vertically on mobile with VS badge between them. Horizontal row on desktop.
- NavBar: Hamburger menu default. Desktop links appear at 768px breakpoint.
- Buttons: Full-width on mobile, auto-width on desktop. Sharp corners, 4px borders.
- Cards: 4px solid accent border, blocky shadow, no rounded corners.

## Do's and Don'ts

**Do:**
- Use CSS variables for all colors and spacing
- Follow mobile-first media query pattern (`min-width`)
- Keep sharp corners — no border-radius
- Use blocky shadows (no blur)
- Self-host fonts with `font-display: swap`
- Use semantic HTML elements

**Don't:**
- Add border-radius to any element
- Use Tailwind or CSS-in-JS
- Use smooth/blur shadows
- Hardcode color values in components
- Skip focus states (required for accessibility)
- Use `max-width` media queries (use `min-width` mobile-first)
