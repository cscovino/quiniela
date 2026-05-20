# 🎮 Pronostics App - Project Plan

> **Retro Pixel Art Football Prediction App**
> Built with Astro + React + Firebase (Firestore)
> Target: 2026 FIFA World Cup & future tournaments

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Design System - Atomic Design](#design-system---atomic-design)
4. [User Stories](#user-stories)
5. [Firestore Schema](#firestore-schema)
6. [Security Rules](#security-rules)
7. [Cloud Functions](#cloud-functions)
8. [Roadmap & Sprints](#roadmap--sprints)
9. [Progress Tracker](#progress-tracker)
10. [Notes & Decisions](#notes--decisions)

---

## 📌 Project Overview

**Application:** Web app for sports tournament predictions (2026 FIFA World Cup, Copa América, etc.)

**Goal:** Allow users to predict match outcomes, track real-time rankings, earn badges, and compete for the best predictions.

**Key Features:**
- ✅ Tournament/Group/Team/Match management
- ✅ User predictions (scores, group standings, knockout winners)
- ✅ Real-time rankings and statistics
- ✅ Gamification (badges, streaks, achievements)
- ✅ Modular design (reusable for any tournament)
- ✅ Retro pixel art aesthetic
- ✅ i18n support (English, Spanish)

**NOT in MVP:**
- ❌ Private leagues/groups (future feature)
- ❌ Friend system (future feature)
- ❌ Social sharing (future feature)

---

## ⚙️ Project Setup & Dev Tooling

### Initial Setup
```bash
# Create Astro project
npm create astro@latest . -- --template minimal --install pnpm --no-git

# Add React integration
pnpm astro add react -y

# Add dev tooling
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-airbnb eslint-config-airbnb-typescript eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-astro
pnpm add -D prettier
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### ESLint Config (`.eslintrc.cjs`)
- Parser: `@typescript-eslint/parser`
- Extends: `airbnb`, `airbnb-typescript`, `plugin:astro/recommended`
- Rules: No default export requirement, ignore packages extensions, React 19 JSX transform

### Prettier Config (`.prettierrc`)
- Semi: true
- Single quote: true
- Trailing comma: all
- Print width: 100

### Husky Hooks
- **pre-commit**: `lint-staged` (ESLint + Prettier on staged files)
- **commit-msg**: `commitlint` (conventional commits validation)

### lint-staged
```json
{
  "src/**/*.{js,jsx,ts,tsx,astro}": ["eslint --fix", "prettier --write"]
}
```

### Vitest Config
- Environment: `jsdom`
- Setup files: `@testing-library/jest-dom`
- Test match: `**/*.test.{ts,tsx}`

### TypeScript Config
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`
- JSX: `react-jsx` (React 19)
- Include: Astro client types

---

## 🛠 Tech Stack

### Core Framework
| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Astro | Latest stable |
| **UI Library** | React | 19.x (stable) |
| **Integration** | @astrojs/react | Latest stable |
| **Styling** | Custom CSS Variables (no Tailwind) | - |
| **Package Manager** | pnpm | Latest |

### Backend & Database
| Layer | Technology | Version |
|-------|-----------|---------|
| **Database** | Firestore (Firebase) | v10+ |
| **Authentication** | Firebase Auth (Email/Password + Google OAuth) | v10+ |
| **Backend** | Firebase Cloud Functions | v4+ |
| **Hosting** | Firebase Hosting | - |
| **Real-time** | Firestore `onSnapshot` | - |

### Dev Tooling
| Tool | Purpose | Version |
|------|---------|---------|
| **Vite** | Build tool (Astro uses Vite under the hood) | Latest stable |
| **Vitest** | Unit testing for React components | Latest stable |
| **ESLint** | Code linting (Airbnb + TypeScript rules) | Latest stable |
| **Prettier** | Code formatting | Latest stable |
| **Husky** | Git hooks (pre-commit, commit-msg) | Latest stable |
| **Commitlint** | Conventional commit validation | Latest stable |
| **lint-staged** | Run linters on staged files only | Latest stable |
| **TypeScript** | Type safety | Latest stable |

### Utilities
| Package | Purpose |
|---------|---------|
| **Zustand** | State management |
| **React Hook Form** | Form handling & validation |
| **Firebase SDK** | Firebase client |
| **astro-i18n** | Astro i18n routing & translation |

### i18n Strategy
| Aspect | Approach |
|--------|----------|
| **Library** | Astro built-in i18n routing (`astro:i18n` module) |
| **Supported Locales** | `en` (English), `es` (Spanish) |
| **Default Locale** | `en` |
| **Routing** | Prefix-based: `/en/...`, `/es/...` with root redirect |
| **Config** | `i18n: { defaultLocale: 'en', locales: ['en', 'es'], routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true } }` |
| **Translation Files** | JSON format in `src/locales/{locale}/*.json` |
| **Locale Detection** | URL prefix → fallback to default `en` |
| **Date/Number Formatting** | `Intl` API with user's locale |
| **Team Names** | Stored as-is (proper nouns), display names translated via locale keys |

### Translation File Structure
```
src/
└── locales/
    ├── en/
    │   ├── common.json      # Shared UI strings (buttons, labels, etc.)
    │   ├── tournament.json  # Tournament-related strings
    │   ├── auth.json        # Login/register strings
    │   └── badges.json      # Badge names & descriptions
    └── es/
        ├── common.json
        ├── tournament.json
        ├── auth.json
        └── badges.json
```

### i18n Implementation Notes
- Astro pages use `astro-i18n` for route generation (`/en/tournament/...`, `/es/tournament/...`)
- React islands use `react-i18next` with shared translation files
- Language switcher component in NavBar
- Firestore data is locale-agnostic (team names, tournament names stored as-is)
- UI strings only need translation (labels, buttons, messages, badges)
- Date/time formatting uses `Intl.DateTimeFormat` with user locale

### Fonts
| Font | Usage |
|------|-------|
| **Press Start 2P** | Pixel headings (Google Fonts) |
| **Inter** | Body text (Google Fonts) |

### Notifications & Charts
| Layer | Technology |
|-------|-----------|
| **Notifications** | Browser Notifications + In-app toasts |
| **Charts** | Chart.js or lightweight alternative |

---

## 🎨 Design System - Atomic Design

### Visual Style: Retro Pixel Art

**Aesthetic:** Bold pixel art style targeting nostalgia with classic football video games.

### Design Tokens

#### Colors

```css
:root {
  /* Primary - Retro Green (pitch) */
  --color-primary-50: #e6f5e6;
  --color-primary-100: #b3e0b3;
  --color-primary-500: #2d8a2d;
  --color-primary-700: #1a5c1a;
  --color-primary-900: #0d330d;
  
  /* Accent - Retro Gold (trophies) */
  --color-accent-50: #fff8e1;
  --color-accent-500: #ffc107;
  --color-accent-700: #c49000;
  
  /* Background */
  --bg-dark: #1a1a2e;
  --bg-card: #16213e;
  --bg-surface: #0f3460;
  
  /* Text */
  --text-primary: #e8e8e8;
  --text-secondary: #a0a0b0;
  --text-muted: #6b6b80;
  
  /* Status */
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  --color-info: #2196f3;
}
```

#### Typography

```css
:root {
  --font-pixel: 'Press Start 2P', 'Silkscreen', monospace;
  --font-body: 'Inter', system-ui, sans-serif;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
}
```

#### Spacing (8px grid)

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}
```

#### Pixel Art Styling

```css
:root {
  --border-pixel: 4px solid var(--color-primary-500);
  --shadow-pixel: 4px 4px 0px rgba(0,0,0,0.3);
  --radius-none: 0;  /* Sharp corners - pixel art */
}
```

### Component Hierarchy

```
src/components/
├── atoms/           # Basic building blocks
│   ├── Button/
│   ├── Input/
│   ├── Badge/
│   ├── Avatar/
│   ├── Icon/
│   ├── Typography/
│   ├── Spinner/
│   ├── Checkbox/
│   ├── Radio/
│   ├── Tooltip/
│   ├── Divider/
│   └── ProgressBar/
├── molecules/       # Simple combinations
│   ├── MatchCard/
│   ├── PredictionInput/
│   ├── TeamSelector/
│   ├── StatCard/
│   ├── NotificationItem/
│   ├── ScoreDisplay/
│   ├── CountdownTimer/
│   ├── RankingRow/
│   └── GroupHeader/
├── organisms/       # Complex sections
│   ├── MatchList/
│   ├── PredictionForm/
│   ├── RankingsTable/
│   ├── GroupStandings/
│   ├── BracketView/
│   ├── UserProfile/
│   ├── NavBar/
│   ├── TournamentHeader/
│   └── NotificationPanel/
└── templates/       # Page layouts
    ├── TournamentLayout/
    ├── AdminLayout/
    ├── ProfileLayout/
    └── AuthLayout/
```

### Pixel Art Assets Needed

- ⚽ Football/soccer ball
- 🏟️ Stadium
- 🏆 Trophy
- 🥇🥈🥉 Medals
- 🔥 Fire (on-fire badge)
- ⚡ Lightning (streak)
- 🎯 Target (accuracy)
- 📊 Chart icon
- 🔔 Bell (notifications)
- 👤 User silhouette
- Team flag placeholders
- Status icons (live, finished, scheduled)

### Key Design Principles

1. **Sharp corners everywhere** - No border-radius
2. **Blocky shadows** - `box-shadow: 4px 4px 0px` (no blur)
3. **Pixel borders** - Thick solid borders (3-4px)
4. **Retro animations** - Frame-by-frame CSS animations
5. **Limited color palette** - 8-bit inspired, no gradients
6. **Pixel font for headings** - Body text stays readable

---

## 📝 User Stories

### Epic 1: Tournament & Structure Management

#### US-001: Create a Tournament
**As a** system administrator, **I want** to create a new tournament, **so that** users can predict its outcomes.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Tournament includes: `name`, `slug` (unique), `startDate`, `endDate`, `phases`, `status` (`draft`, `active`, `finished`)
  - [ ] Phases configurable with order
  - [ ] Validate `startDate < endDate`
  - [ ] Validate `slug` is unique and URL-safe
  - [ ] Default `status` is `draft`; admin can publish to `active`
  - [ ] Data stored in `tournaments/{tournamentId}`

#### US-002: Create Groups in a Tournament
**As a** system administrator, **I want** to create groups for a tournament, **so that** teams can be organized and matches scheduled.

- **Priority:** High | **Effort:** 2
- **Acceptance Criteria:**
  - [ ] Each group includes: `name`, `slug`, `tournamentId`, `order`
  - [ ] Validate `tournamentId` exists
  - [ ] Validate `slug` is unique within tournament
  - [ ] Stored in `tournaments/{tournamentId}/groups/{groupId}` (subcollection)

#### US-003: Add Teams to a Tournament
**As a** system administrator, **I want** to add teams to a tournament, **so that** users can recognize them and predict their matches.

- **Priority:** High | **Effort:** 2
- **Acceptance Criteria:**
  - [ ] Each team includes: `name`, `fifaCode` (unique), `flagUrl`, `groupId`
  - [ ] Validate `fifaCode` is unique across all teams
  - [ ] Validate `groupId` exists in tournament
  - [ ] Stored in `tournaments/{tournamentId}/teams/{teamId}` (subcollection)

#### US-004: Create Matches
**As a** system administrator, **I want** to create matches for a tournament, **so that** users can predict their outcomes.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Each match includes: `slug`, `phase`, `homeTeamId`, `awayTeamId`, `date`, `stadium`, `result`, `status`, `predictionDeadline`
  - [ ] `status`: `scheduled`, `live`, `finished`, `postponed`, `cancelled`
  - [ ] Teams can be `null` for TBD knockout matches
  - [ ] Validate `predictionDeadline < date`
  - [ ] Stored in `tournaments/{tournamentId}/matches/{matchId}` (subcollection)

#### US-005: Update Match Results
**As a** system administrator, **I want** to update the result of a match, **so that** the system can automatically calculate user points and standings.

- **Priority:** High | **Effort:** 4
- **Acceptance Criteria:**
  - [ ] Updating result sets `status: finished`
  - [ ] Trigger Cloud Function to calculate points, update standings, update user stats
  - [ ] Validate scores are non-negative integers
  - [ ] Handle `postponed`/`cancelled` (no points awarded)
  - [ ] Idempotent: re-running doesn't double-count

---

### Epic 2: User Predictions

#### US-006: User Registration & Login
**As a** user, **I want** to register and login to the app, **so that** I can make predictions and compete in rankings.

- **Priority:** High | **Effort:** 4
- **Acceptance Criteria:**
  - [ ] Registration with: `email`, `password`, `displayName`, `avatarUrl` (optional), `favoriteTeamId` (optional)
  - [ ] Login with email/password and Google OAuth
  - [ ] Password reset via email
  - [ ] Session persistence
  - [ ] Data stored in `users/{uid}`
  - [ ] Auto-create default predictor on registration
  - [ ] Rate limit registration attempts

#### US-006b: Manage Predictors
**As a** user, **I want** to create and manage multiple predictors, **so that** I can submit predictions under different names.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Create predictor with: `name`, `avatarUrl` (optional)
  - [ ] Edit predictor name/avatar
  - [ ] Delete predictor (only if no bets made)
  - [ ] Switch active predictor before making predictions
  - [ ] Stored in `users/{userId}/predictors/{predictorId}`
  - [ ] Each predictor has independent stats and rankings

#### US-007: Predict Match Score
**As a** predictor, **I want** to predict the score of a match, **so that** I can earn points if I'm correct.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Predictors predict: `homeScore`, `awayScore` (0-15)
  - [ ] Stored in `tournaments/{tournamentId}/bets/{betId}` with `userId` + `predictorId`
  - [ ] **Block if:** match is `live`/`finished`/`postponed`/`cancelled`, current time > `predictionDeadline`, predictor already bet
  - [ ] **Allow edit if:** match not started and predictor owns bet

#### US-008: Predict Group Standings
**As a** predictor, **I want** to predict the final standings of a group, **so that** I can earn bonus points.

- **Priority:** Medium | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Predictors rank all teams in group (1st to 4th)
  - [ ] Stored in `tournaments/{tournamentId}/group_bets/{betId}` with `userId` + `predictorId`
  - [ ] **Block if:** any match in group has started
  - [ ] Validate all teams included exactly once

#### US-009: Predict Knockout Winner
**As a** predictor, **I want** to predict the winner of a knockout match, **so that** I can earn points.

- **Priority:** Medium | **Effort:** 2
- **Acceptance Criteria:**
  - [ ] Predictors select winner (`homeTeamId` or `awayTeamId`)
  - [ ] Stored in `tournaments/{tournamentId}/knockout_bets/{betId}` with `userId` + `predictorId`
  - [ ] **Block if:** teams are TBD or match has started

---

### Epic 3: Rankings & Statistics

#### US-010: Calculate Prediction Points
**As a** system, **I want** to calculate points when a match ends, **so that** rankings are updated.

- **Priority:** High | **Effort:** 4
- **Acceptance Criteria:**
  - [ ] **Exact prediction** (correct score): **+3 points**
  - [ ] **Correct outcome** (correct winner/draw, wrong score): **+1 point**
  - [ ] **Incorrect prediction**: **0 points**
  - [ ] Idempotent: re-running doesn't double-count
  - [ ] Handle postponed/cancelled matches

#### US-011: Update Group Standings
**As a** system, **I want** to update group standings when a match ends, **so that** users see current rankings.

- **Priority:** High | **Effort:** 5
- **Acceptance Criteria:**
  - [ ] Calculate: `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `goalDifference`, `points`
  - [ ] Sort by: Points ↓, Goal Difference ↓, Goals For ↓
  - [ ] Store in `tournaments/{tournamentId}/group_standings/{groupId}`
  - [ ] Recompute from scratch (idempotent)

#### US-012: Update Predictor Statistics
**As a** system, **I want** to update predictor statistics after points calculation, **so that** performance is reflected in rankings.

- **Priority:** High | **Effort:** 4
- **Acceptance Criteria:**
  - [ ] Update `users/{userId}/predictors/{predictorId}/stats/{tournamentId}` with: `totalPoints`, `exactBets`, `winnerBets`, `totalBets`, `accuracy`, `currentStreak`, `maxStreak`, `pointsHistory`
  - [ ] Use Firestore transaction
  - [ ] Handle edge case: predictor has no bets yet

#### US-013: Display Predictor Ranking
**As a** user, **I want** to see the ranking of all predictors, **so that** I can compare my performance.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Table sorted by `totalPoints` ↓, then `accuracy` (tiebreaker)
  - [ ] Columns: Position, Avatar, Predictor Name, Owner, Points, Accuracy, Streak, Badges
  - [ ] Highlight current user's predictors
  - [ ] Paginate (20 per page)
  - [ ] Cache ranking data for 5 minutes

#### US-014: Display Points Evolution Graph
**As a** user, **I want** to see my points evolution over time, **so that** I can analyze my performance.

- **Priority:** Medium | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Line chart with dates (X) and cumulative points (Y)
  - [ ] Show milestones (badges, streaks)
  - [ ] Mobile-responsive
  - [ ] Fallback if no data

---

### Epic 4: Gamification

#### US-015: Auto-Assign Badges
**As a** system, **I want** to auto-assign badges based on achievements, **so that** users stay engaged.

- **Priority:** Medium | **Effort:** 4
- **Acceptance Criteria:**
  - [ ] **Badges:**
    - `"on-fire"`: 3 exact predictions in a row
    - `"top-10"`: User in top 10% of ranking
    - `"perfect-group"`: All group stage predictions correct
    - `"clairvoyant"`: Predicted tournament winner early
    - `"first-blood"`: First prediction made
    - `"consistent"`: 10+ correct predictions total
  - [ ] Award badge only once per tournament
  - [ ] Trigger after each points calculation

#### US-016: Display Badges on Profile
**As a** user, **I want** to see my badges on my profile, **so that** I can show off achievements.

- **Priority:** Medium | **Effort:** 2
- **Acceptance Criteria:**
  - [ ] Display as icons with tooltip descriptions
  - [ ] Sort by date earned (newest first)
  - [ ] Show locked/grayed out badges not yet earned
  - [ ] Show progress toward next badge

---

### Epic 5: UI/UX

#### US-017: Display Tournament List
**As a** user, **I want** to see available tournaments, **so that** I can select which one to participate in.

- **Priority:** High | **Effort:** 2
- **Acceptance Criteria:**
  - [ ] Cards showing: `name`, `dates`, `status`, `participant count`
  - [ ] Filter by: `active`, `upcoming`, `finished`
  - [ ] Sort by: `startDate` (default), `name`
  - [ ] Show "No tournaments" empty state

#### US-018: Display Tournament Details
**As a** user, **I want** to see tournament structure and matches, **so that** I can understand and participate.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Tabs: `Groups`, `Matches`, `Rankings`, `My Predictions`
  - [ ] Groups tab: show groups with teams and standings
  - [ ] Matches tab: filter by group/phase/status, sort by date
  - [ ] Show match status badges
  - [ ] Countdown timer for upcoming matches

#### US-019: Display Group Matches
**As a** user, **I want** to see matches in a table format, **so that** I can make predictions easily.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Table: Date, Home Team, Away Team, Result, Your Prediction, Status
  - [ ] Row actions: "Predict" button (if not finished/deadline passed)
  - [ ] Highlight finished matches
  - [ ] Show points earned on finished matches

#### US-020: Prediction Form
**As a** user, **I want** an easy prediction form, **so that** I can submit predictions quickly.

- **Priority:** High | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Group matches: number inputs for scores (0-15)
  - [ ] Knockout matches: team selector (radio buttons)
  - [ ] Show countdown to prediction deadline
  - [ ] Validation: non-negative integers, max 15
  - [ ] Confirmation toast on submit
  - [ ] Disable form after deadline

#### US-021: Real-Time Notifications
**As a** user, **I want** notifications for important events, **so that** I stay informed.

- **Priority:** Medium | **Effort:** 4
- **Acceptance Criteria:**
  - [ ] Notify on: match starting soon, result posted, badge earned, ranking change
  - [ ] In-app toast notifications
  - [ ] Notification preferences
  - [ ] Badge count on notification icon

---

### Epic 6: Administration

#### US-022: Admin Dashboard
**As an** administrator, **I want** a dashboard to manage tournament data, **so that** I can configure the app.

- **Priority:** Medium | **Effort:** 5
- **Acceptance Criteria:**
  - [ ] CRUD for: tournaments, groups, teams, matches
  - [ ] Bulk import matches from CSV/JSON
  - [ ] Update match results with validation
  - [ ] View all user predictions for a match
  - [ ] Only accessible to users with `role: admin`
  - [ ] Audit log for admin actions

#### US-023: Import/Export Data
**As an** administrator, **I want** to import/export tournament data, **so that** I can backup or migrate.

- **Priority:** Low | **Effort:** 3
- **Acceptance Criteria:**
  - [ ] Export tournament to JSON (all collections)
  - [ ] Import from validated JSON file
  - [ ] Validate references
  - [ ] Dry-run mode
  - [ ] Only accessible to admins

---

## 🗄 Firestore Schema

### Collections Structure

```
tournaments/
  {tournamentId}/                          # Document ID = slug (e.g., "world-cup-2026")
    {
      slug: "world-cup-2026",
      name: "FIFA World Cup 2026",
      startDate: "2026-06-20T00:00:00Z",
      endDate: "2026-07-20T00:00:00Z",
      status: "active",                    # draft | active | finished
      phases: [
        {name: "group", order: 1},
        {name: "round-of-16", order: 2},
        {name: "quarterfinals", order: 3},
        {name: "semifinals", order: 4},
        {name: "final", order: 5}
      ],
      createdAt: "...",
      updatedAt: "..."
    }
    
    groups/                                # Subcollection
      {groupId}/                           # Document ID = slug (e.g., "group-a")
        {
          slug: "group-a",
          name: "Group A",
          order: 1,
          teamCount: 4,
          createdAt: "..."
        }
    
    teams/                                 # Subcollection
      {teamId}/                            # Document ID = fifaCode (e.g., "arg")
        {
          fifaCode: "ARG",
          name: "Argentina",
          flagUrl: "/flags/arg.svg",
          groupId: "group-a",
          createdAt: "..."
        }
    
    matches/                               # Subcollection
      {matchId}/                           # Document ID = slug (e.g., "match-1")
        {
          slug: "match-1",
          phase: "group",
          groupId: "group-a",
          homeTeamId: "arg",
          awayTeamId: "mex",
          date: "2026-06-20T16:00:00Z",
          stadium: "Azteca Stadium",
          result: { home: null, away: null },
          status: "scheduled",             # scheduled | live | finished | postponed | cancelled
          predictionDeadline: "2026-06-20T15:50:00Z",
          createdAt: "..."
        }
    
    bets/                                  # Subcollection - Match predictions
      {betId}/                             # Document ID = "{predictorId}-{matchId}"
        {
          userId: "user-uid",
          predictorId: "user-uid-default",
          matchId: "match-1",
          homeScore: 2,
          awayScore: 1,
          points: 0,
          isExact: false,
          isWinner: false,
          createdAt: "...",
          updatedAt: "..."
        }
    
    group_bets/                            # Subcollection - Group standings predictions
      {betId}/                             # Document ID = "{predictorId}-{groupId}"
        {
          userId: "user-uid",
          predictorId: "user-uid-default",
          groupId: "group-a",
          positions: ["arg", "mex", "pol", "ksa"],
          points: 0,
          createdAt: "...",
          updatedAt: "..."
        }
    
    knockout_bets/                         # Subcollection - Knockout predictions
      {betId}/                             # Document ID = "{predictorId}-{matchId}"
        {
          userId: "user-uid",
          predictorId: "user-uid-default",
          matchId: "match-r16-1",
          predictedWinner: "arg",
          points: 0,
          createdAt: "..."
        }
    
    group_standings/                       # Subcollection - Computed standings
      {standingId}/                        # Document ID = "{groupId}"
        {
          groupId: "group-a",
          lastUpdated: "...",
          standings: [
            {
              teamId: "arg",
              position: 1,
              played: 2, won: 2, drawn: 0, lost: 0,
              goalsFor: 5, goalsAgainst: 1, goalDifference: 4,
              points: 6
            }
          ]
        }

users/                                     # Top-level collection
  {userId}/                                # Document ID = Firebase Auth UID
    {
      uid: "firebase-auth-uid",
      displayName: "Carlos Enrique",
      email: "carlos@example.com",
      avatarUrl: "/avatars/user-1.png",
      favoriteTeamId: "arg",
      role: "user",                        # user | admin
      createdAt: "...",
      lastLoginAt: "...",
      
      predictors/                          # Subcollection - User's predictors
        {predictorId}/                     # Document ID = "{userId}-{slug}" (e.g., "user123-default")
          {
            id: "user123-default",
            userId: "user123",
            name: "Carlos Enrique",
            avatarUrl: "/avatars/predictor-1.png",
            createdAt: "..."
          }
          
          stats/                           # Subcollection - Predictor stats per tournament
            {tournamentId}/                # Document ID = tournament slug
              {
                predictorId: "user123-default",
                tournamentId: "world-cup-2026",
                totalPoints: 45,
                exactBets: 8,
                winnerBets: 12,
                totalBets: 30,
                accuracy: 0.67,
                currentStreak: 3,
                maxStreak: 5,
                pointsHistory: [
                  { timestamp: "...", points: 3, matchId: "match-1" }
                ],
                badgesAwarded: {
                  "on-fire": "2026-06-20T...",
                  "first-blood": "2026-06-19T..."
                },
                lastUpdated: "..."
              }
        
        notifications/                     # Subcollection - User notifications
          {notificationId}/
            {
              type: "badge_earned",
              title: "Badge Earned!",
              message: "You earned the On Fire badge!",
              read: false,
              createdAt: "..."
            }
```

---

## 🔒 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner() {
      return request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    function isOwnerNew() {
      return request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    function isPredictorOwner(predictorId) {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)/predictors/$(predictorId)).exists();
    }
    
    // Users - read own profile, admin reads all
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
      allow delete: if isAdmin();
      
      // Predictors - user manages their own predictors
      match /predictors/{predictorId} {
        allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update: if request.auth.uid == userId;
        allow delete: if request.auth.uid == userId;
        
        // Predictor stats - read own, Cloud Functions write
        match /stats/{tournamentId} {
          allow read: if request.auth.uid == userId || isAdmin();
          allow write: if false; // Only Cloud Functions can write
        }
      }
      
      // Notifications
      match /notifications/{notificationId} {
        allow read: if request.auth.uid == userId;
        allow write: if false; // Only Cloud Functions can write
      }
    }
    
    // Tournaments - public read, admin write
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if isAdmin();
      
      // Groups
      match /groups/{groupId} {
        allow read: if true;
        allow write: if isAdmin();
      }
      
      // Teams
      match /teams/{teamId} {
        allow read: if true;
        allow write: if isAdmin();
      }
      
      // Matches - public read, admin write
      match /matches/{matchId} {
        allow read: if true;
        allow write: if isAdmin();
      }
      
      // Bets - predictor owns their bets
      match /bets/{betId} {
        allow read: if request.auth != null;
        allow create: if isOwnerNew() && isPredictorOwner(request.resource.data.predictorId);
        allow update: if isOwner() && isPredictorOwner(resource.data.predictorId);
        allow delete: if isOwner() || isAdmin();
      }
      
      // Group bets
      match /group_bets/{betId} {
        allow read: if request.auth != null;
        allow create: if isOwnerNew() && isPredictorOwner(request.resource.data.predictorId);
        allow update: if isOwner() && isPredictorOwner(resource.data.predictorId);
        allow delete: if isOwner() || isAdmin();
      }
      
      // Knockout bets
      match /knockout_bets/{betId} {
        allow read: if request.auth != null;
        allow create: if isOwnerNew() && isPredictorOwner(request.resource.data.predictorId);
        allow update: if isOwner() && isPredictorOwner(resource.data.predictorId);
        allow delete: if isOwner() || isAdmin();
      }
      
      // Group standings - read only, Cloud Functions write
      match /group_standings/{standingId} {
        allow read: if true;
        allow write: if false;
      }
    }
  }
}
```

---

## ⚙️ Cloud Functions

### Cloud Functions

| Function | Trigger | Status | Description |
|----------|---------|--------|-------------|
| `calculateMatchResult` | `matches/{matchId}` update (status → finished) | ✅ Done | Calculate points for all bets on a match (+3 exact, +1 correct outcome) |
| `updateGroupStandings` | `matches/{matchId}` update (pointsCalculated → true) | ✅ Done | Recompute group standings from scratch |
| `updatePredictorStats` | `bets/{betId}` update (points changed) | ✅ Done | Update predictor statistics and streaks |
| `checkAndAwardBadges` | `users/{userId}/predictors/{predictorId}/stats/{tournamentId}` update | ✅ Done | Check badge conditions and award if met |
| `createNotification` | Various triggers | ⬜ Not Started | Create in-app notifications for users |
| `sendMatchReminder` | Scheduled (every 15 min) | ⬜ Not Started | Send notifications for matches starting soon |

### Function Details

#### `calculateMatchPoints`
```javascript
// Trigger: matches/{matchId} onUpdate
// When match status changes to "finished"
// Logic:
// 1. Get all bets for this match
// 2. For each bet:
//    - Exact score (home & away match): +3 points, isExact=true
//    - Correct outcome (winner/draw match): +1 point, isWinner=true
//    - Incorrect: 0 points
// 3. Update bet document with points
// 4. Set pointsCalculated=true on match to prevent re-processing
```

#### `updateGroupStandings`
```javascript
// Trigger: matches/{matchId} onUpdate
// When match status changes to "finished"
// Logic:
// 1. Get all finished matches in the group
// 2. For each team, calculate: played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points
// 3. Sort by: points ↓, goalDifference ↓, goalsFor ↓
// 4. Write to group_standings/{groupId}
// 5. Recompute from scratch (idempotent)
```

#### `updatePredictorStats`
```javascript
// Trigger: bets/{betId} onUpdate (when points change)
// Logic:
// 1. Get all bets for predictor in tournament
// 2. Calculate: totalPoints, exactBets, winnerBets, totalBets, accuracy
// 3. Calculate currentStreak and maxStreak
// 4. Add to pointsHistory
// 5. Write to users/{userId}/predictors/{predictorId}/stats/{tournamentId}
```

#### `checkAndAwardBadges`
```javascript
// Trigger: users/{userId}/predictors/{predictorId}/stats/{tournamentId} onUpdate
// Logic:
// 1. Check each badge condition:
//    - "on-fire": currentStreak >= 3
//    - "top-10": position <= totalPredictors * 0.1
//    - "perfect-group": all group bets correct
//    - "clairvoyant": predicted winner from group stage
//    - "first-blood": totalBets >= 1
//    - "consistent": winnerBets >= 10
// 2. If condition met and not already awarded, add to badgesAwarded
```

---

## 🗺 Roadmap & Sprints

### Sprint 1: Foundation & Core (Effort: 29)
- [ ] US-001: Create a Tournament
- [ ] US-002: Create Groups
- [ ] US-003: Add Teams
- [ ] US-004: Create Matches
- [ ] US-005: Update Match Results
- [ ] US-006: User Registration & Login
- [ ] US-006b: Manage Predictors
- [ ] US-007: Predict Match Score
- [ ] US-008: Predict Group Standings
- [ ] US-009: Predict Knockout Winner

### Sprint 2: Rankings & Gamification (Effort: 22)
- [ ] US-010: Calculate Prediction Points
- [ ] US-011: Update Group Standings
- [ ] US-012: Update User Statistics
- [ ] US-013: Display User Ranking
- [ ] US-014: Display Points Evolution Graph
- [ ] US-015: Auto-Assign Badges
- [ ] US-016: Display Badges on Profile

### Sprint 3: UI/UX Polish (Effort: 15)
- [ ] US-017: Display Tournament List
- [ ] US-018: Display Tournament Details
- [ ] US-019: Display Group Matches
- [ ] US-020: Prediction Form
- [ ] US-021: Real-Time Notifications

### Sprint 4: Administration (Effort: 8)
- [ ] US-022: Admin Dashboard
- [ ] US-023: Import/Export Data

### Design System Parallel Track
- [ ] Phase 1: Design tokens & global styles
- [ ] Phase 2: Atoms (12 components)
- [ ] Phase 3: Molecules (9 components)
- [ ] Phase 4: Organisms (9 components)
- [ ] Phase 5: Templates (4 layouts)
- [ ] Phase 6: Pixel art assets

**Total Effort: 71 points**

---

## 📊 Progress Tracker

### Sprint 1: Foundation & Core
| US | Story | Status | Notes |
|----|-------|--------|-------|
| US-001 | Create a Tournament | ✅ Done | Seeded via `scripts/seed-tournament.ts` |
| US-002 | Create Groups | ✅ Done | Seeded via `scripts/seed-tournament.ts` |
| US-003 | Add Teams | ✅ Done | Seeded via `scripts/seed-tournament.ts` |
| US-004 | Create Matches | ✅ Done | Seeded via `scripts/seed-tournament.ts` (72 group + 32 knockout) |
| US-005 | Update Match Results | ✅ Done | Cloud Functions: calculateMatchResult, updateGroupStandings, updatePredictorStats, checkAndAwardBadges |
| US-006 | User Registration & Login | ✅ Done | Zustand store, login/register forms, auth pages ES+EN, NavBar integration |
| US-006b | Manage Predictors | ✅ Done | Schema ready, default predictor auto-created |
| US-007 | Predict Match Score | ⬜ Not Started | |
| US-008 | Predict Group Standings | ⬜ Not Started | |
| US-009 | Predict Knockout Winner | ⬜ Not Started | |

### Sprint 2: Rankings & Gamification
| US | Story | Status | Notes |
|----|-------|--------|-------|
| US-010 | Calculate Prediction Points | ✅ Done | Cloud Function `calculateMatchResult` (+3 exact, +1 outcome) |
| US-011 | Update Group Standings | ✅ Done | Cloud Function `updateGroupStandings` (recomputes from scratch) |
| US-012 | Update User Statistics | ✅ Done | Cloud Function `updatePredictorStats` (points, accuracy, streaks) |
| US-013 | Display User Ranking | ⬜ Not Started | Components built, needs Firestore connection |
| US-014 | Display Points Evolution Graph | ⬜ Not Started | |
| US-015 | Auto-Assign Badges | ✅ Done | Cloud Function `checkAndAwardBadges` (first-blood, on-fire, consistent, perfect-group) |
| US-016 | Display Badges on Profile | ⬜ Not Started | |

### Sprint 3: UI/UX Polish
| US | Story | Status | Notes |
|----|-------|--------|-------|
| US-017 | Display Tournament List | 🔄 In Progress | HomeTemplate built, needs real Firestore data |
| US-018 | Display Tournament Details |  In Progress | Templates built, needs real Firestore data |
| US-019 | Display Group Matches | 🔄 In Progress | MatchList built, needs real Firestore data |
| US-020 | Prediction Form | 🔄 In Progress | PredictionForm built, needs Firestore write |
| US-021 | Real-Time Notifications | ⬜ Not Started | |

### Sprint 4: Administration
| US | Story | Status | Notes |
|----|-------|--------|-------|
| US-022 | Admin Dashboard | ✅ Done | Admin-only `/en/admin/matches` page, match result form, role guard, NavBar link |
| US-023 | Import/Export Data | ⬜ Not Started | |

### Project Setup ✅
| Task | Status | Notes |
|------|--------|-------|
| Astro 6 + React 19 | ✅ Done | Islands architecture configured |
| i18n routing (en/es) | ✅ Done | Default locale `es` at `/`, English at `/en/` |
| TypeScript strict | ✅ Done | Path aliases configured |
| ESLint + Prettier | ✅ Done | Flat config (`.ts`), astro plugin |
| Husky + Commitlint | ✅ Done | Pre-commit + commit-msg hooks (`.commitlintrc`) |
| Vitest + Testing Library | ✅ Done | jsdom environment |
| Zustand state management | ✅ Done | Auth store with Firebase integration |
| Firebase SDK | ✅ Done | Initialized with Firestore + Auth + Storage |
| Firestore security rules | ✅ Done | Deployed with predictor-based access control |
| Predictor system | ✅ Done | Schema updated, default predictor auto-created on signup |
| Auth pages | ✅ Done | Login/Register forms (ES + EN), NavBar integration |
| Design tokens (global.css) | ✅ Done | Full token system: colors, spacing, typography, shadows, animations, z-index, breakpoints |
| Locale files (en/es) | ✅ Done | common.json + auth.json with shared strings |
| Vite aliases | ✅ Done | `@/`, `@atoms/`, `@molecules/`, `@organisms/`, `@layouts/`, `@styles/`, etc. |
| Base layout | ✅ Done | `BaseLayout.astro` with locale switcher |
| Cloud Functions | ✅ Done | 4 functions: calculateMatchResult, updateGroupStandings, updatePredictorStats, checkAndAwardBadges |
| Admin Dashboard | ✅ Done | `/en/admin/matches` with role guard, match result form, NavBar link |
| Seed script | ✅ Done | `pnpm seed` populates 165 documents (tournament, groups, teams, matches) |
| Admin role script | ✅ Done | `pnpm set-admin <user-id>` promotes user to admin |

### Design System
| Phase | Description | Status | Notes |
|-------|-------------|--------|-------|
| Phase 1 | Design tokens & global styles | ✅ Done | Full token system with light/dark themes, 8-bit palette, spacing scale, animations |
| Phase 2 | Atoms (12 components) | ✅ Done | Button, Input, Badge, Avatar, Icon, Typography, Spinner, Checkbox, Radio, Tooltip, Divider, ProgressBar |
| Phase 3 | Molecules (9 components) | ✅ Done | TeamFlag, MatchCard, PredictionInput, TeamSelector, StatCard, ScoreDisplay, CountdownTimer, RankingRow, GroupHeader |
| Phase 4 | Organisms (9 components) | ✅ Done | NavBar, TournamentHeader, MatchList, PredictionForm, GroupStandings, RankingsTable, BracketView, UserProfile, NotificationPanel |
| Phase 5 | Templates (4 layouts) | ✅ Done | HomeTemplate, PredictionTemplate, StandingsTemplate, ProfileTemplate |
| Phase 6 | Pixel art assets | ✅ Done | PixelArt component with 13 SVG sprites (football, trophy, stadium, medals, crowd, etc.) + animations |

---

## 📝 Notes & Decisions

### Key Decisions Made
1. **Data Model:** Split `bets` into 3 collections (`bets`, `group_bets`, `knockout_bets`) for clarity
2. **Subcollections:** Used subcollections under `tournaments/` for better data locality
3. **Security:** Firestore security rules enforce admin-only writes, user-only bet access
4. **Prediction Deadlines:** Added `predictionDeadline` field to control when predictions close
5. **Match Status:** Added `status` field to handle live/postponed/cancelled matches
6. **Idempotency:** Cloud Functions use flags to prevent double-processing
7. **Astro + React:** Islands architecture minimizes client JS
8. **Design System:** Atomic Design methodology with retro pixel art aesthetic
9. **CSS Variables:** Custom properties instead of Tailwind for full control
10. **No Social Features in MVP:** Private leagues, friends, sharing deferred to future
11. **Default Locale:** Spanish (`es`) at root `/`, English at `/en/` (no redirect needed)
12. **i18n Structure:** Single page per locale (no `[locale]` dynamic route duplication)
13. **Config Files:** All configs use TypeScript (`.ts`) instead of `.mjs`/`.json`
14. **Vite Aliases:** Path aliases (`@/`, `@atoms/`, etc.) configured in both Vite and TypeScript
15. **Icon System:** pixelarticons (800 pixel art SVGs) replacing emojis for retro aesthetic
16. **Flags:** flag-icons library with 211 FIFA team mappings for country flags
17. **Theme System:** Light/dark themes via `data-theme` attribute with CSS variable switching
18. **Storybook:** v10 with theme switcher, docs addon, and Vitest integration
19. **Templates:** Compose organisms into full page layouts with responsive grid
20. **WC26 Branding:** Official FIFA World Cup 2026 color palette - black primary, electric blue (#00BFFF), magenta (#FF1493), orange (#FF6B35), gold (#FFD700) with pixel art aesthetic
21. **Pixel Art System:** Inline SVG sprites with `image-rendering: pixelated`, 13 sprites (football, trophy, stadium, medals, crowd, etc.), CSS animations (bounce, glow, celebrate, pulse)
22. **Pages & Routing:** 8 Astro pages (4 ES + 4 EN) with BaseLayout, NavBar integration, i18n translations, SEO meta tags
23. **Security:** pnpm `minimum-release-age=72` to prevent supply chain attacks from newly published packages
24. **Predictor System:** Users can create multiple predictors with independent stats/rankings; each bet tied to `userId` + `predictorId`
25. **Cloud Functions:** Automated point calculation, standings updates, predictor stats, and badge awards on match result changes
26. **Admin Dashboard:** English-only admin page at `/en/admin/matches` for updating match results and status
27. **Seed Script:** `pnpm seed` populates complete WC26 data (48 teams, 12 groups, 104 matches) idempotently

### Open Questions
- [ ] Should we add a "late prediction" penalty system?
- [ ] How to handle tiebreaker rules in group standings (head-to-head, fair play)?
- [ ] Should admins be able to edit predictions after deadline (for testing)?
- [ ] Do we need a "prediction lock" notification before deadline?
- [ ] Should we support multiple tournaments simultaneously?

### Future Enhancements (Post-MVP)
- Private leagues/groups
- Friend system with head-to-head stats
- Social sharing of predictions/results
- Push notifications (mobile)
- Multiple tournament support
- Prediction confidence system
- Historical tournament archives
- Admin analytics dashboard

---

*Last updated: 2026-05-20*
