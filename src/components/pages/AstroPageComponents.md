# Astro Page Components

This document describes the 5 Astro page shell components that wrap React template components with `client:load` directive.

## Overview

Astro pages are static shells that extract i18n translations and delegate rendering to React components. They cannot have Storybook stories since `@storybook/astro` does not exist. Test their logic via the underlying React template's Storybook stories.

## Component Reference

| Astro Page | Delegates To | Props |
|------------|-------------|-------|
| `AuthPage.astro` | `AuthTemplate` | `locale`, `initialMode` |
| `PredictionsPage.astro` | `PredictionsTemplate` | `locale` |
| `ProfilePage.astro` | `ProfileTemplate` | `locale` |
| `RankingsPage.astro` | `RankingsTable` + `NavBar` | `locale` |
| `TournamentPage.astro` | `TournamentHeader` + `MatchList` + `GroupStandings` | `locale` |

## Common Pattern

All Astro pages follow the same pattern:

```astro
---
import { AuthTemplate } from '@components/templates/AuthTemplate/AuthTemplate';
import { getTranslations } from '@utils/i18n';

const { locale, initialMode = 'login' } = Astro.props;
const translations = getTranslations(locale, 'auth');
---

<AuthTemplate
  translations={translations}
  initialMode={initialMode}
  locale={locale}
  client:load
/>
```

## Props Interface

Each Astro page accepts:

- **`locale`**: `'en' | 'es'` — required, determines which translation namespace to load
- **`initialMode`** (AuthPage only): `'login' | 'register'` — defaults to `'login'`

## Adding a New Page

1. Create `src/pages/[lang]/NewPage.astro`
2. Import the React template component
3. Call `getTranslations(locale, 'namespace')`
4. Render with `client:load`
5. Add route to `src/utils/slug-map.ts`
6. Test via the template's Storybook stories