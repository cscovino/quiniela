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

**Heading scale:** `heading-xs` (16px) → `heading-xl` (40px), all Press Start 2P
**Text scale:** `text-xs` (10px) → `text-3xl` (32px), all Inter

## Layout

Mobile-first responsive strategy with two breakpoints:

- **320px+ (base):** Single column, stacked layouts, hamburger nav, full-width buttons
- **480px+ (`--breakpoint-sm`):** Increased padding, wider team names, larger fonts
- **768px+ (`--breakpoint-md`):** Multi-column, horizontal nav, full desktop layouts

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

## Components

**Atomic Design structure:**
- **Atoms:** Button, Input, Icon, Badge, Avatar, Spinner, Typography, Tooltip, ProgressBar, Divider, Checkbox, Radio
- **Molecules:** MatchCard, TeamFlag, PredictorSelector, GroupStandings
- **Organisms:** NavBar, Footer, ToastProvider
- **Templates:** HomeTemplate, PredictionsTemplate, TournamentTemplate, RankingsTemplate, ProfileTemplate

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
