# Selective Hydration Strategy

## Current State

All React templates use `client:load` because they:
- Fetch data from Firestore on mount
- Need immediate interactivity (auth, forms, navigation)
- Have no static content to display first

## Target State

After migrating components to Astro:

| Component | Directive | Rationale |
|-----------|-----------|-----------|
| NavBar | `client:load` | Critical for navigation, always visible |
| ToastProvider | `client:load` | Needs to be available immediately |
| Hero section | None (static Astro) | Zero JS, server-rendered |
| TournamentHeader | None (static Astro) | Zero JS, server-rendered |
| MatchList | `client:visible` | Below fold, defer hydration |
| RankingsTable | `client:visible` | Below fold, defer hydration |
| PredictionForm | `client:idle` | Non-critical, hydrate after page load |
| LoginForm | `client:idle` | Non-critical, hydrate after page load |
| BracketView | `client:visible` | Only hydr when scrolled into view |
| AdminMatchesPage | `client:load` | Critical for admin workflow |

## Implementation Steps

1. **Convert static sections to Astro** (Hero, TournamentHeader, MatchCard)
2. **Split HomeTemplate** into:
   - `HeroSection.astro` (static, zero JS)
   - `TournamentHeader.astro` (static, zero JS)
   - `MatchList.astro` (client:visible)
   - `RankingsTable.astro` (client:visible)
3. **Update page files** to use appropriate directives
4. **Measure JS bundle reduction** with Lighthouse

## Expected Impact

- Initial JS: ~150KB → ~50KB (66% reduction)
- Time to Interactive: ~3.5s → ~2s
- Lighthouse Performance: ~75 → ~90+
