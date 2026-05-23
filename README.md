# 🎮 Quiniela

Retro Pixel Art Football Prediction App built with Astro + React + Firebase.

**Lighthouse Scores:** Accessibility 100 | SEO 100 | Best Practices 96

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.12.0
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start dev server
pnpm dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── atoms/       # Basic building blocks (Button, Input, Badge, etc.)
│   ├── molecules/   # Simple combinations (MatchCard, TeamFlag, etc.)
│   ├── organisms/   # Complex sections (MatchList, RankingsTable, NavBar, etc.)
│   └── templates/   # Page layouts
├── content/         # Astro Content Collections
│   ├── teams/       # 48 team JSON files
│   └── groups/      # 12 group JSON files
├── layouts/         # Astro layouts (BaseLayout with SEO metadata)
├── pages/
│   ├── api/         # API routes (/api/matches, /api/rankings)
│   └── [locale]/    # Page files per locale
├── styles/          # Global CSS + design tokens + view transitions
├── lib/             # Firebase Admin SDK utilities
├── store/           # Zustand stores (auth, toast)
├── types/           # TypeScript types (firestore, badges)
├── services/        # Firebase service functions + rankings-service
├── utils/           # Utilities (i18n, performance, flagMapping)
└── middleware.ts    # Astro middleware (locale detection)
public/
├── icons/           # PWA icons
├── screenshots/     # PWA screenshots
├── manifest.json    # Web app manifest
├── sw.js            # Service worker (offline caching)
└── firebase-messaging-sw.js  # FCM background messaging
```

## 🏗 Architecture

**Astro-First Design:**
- Zero-JS by default, React only for interactive islands
- 6 Astro components (MatchCard, MatchList, TournamentHeader, GroupStandings, RankingsTable, NavBar)
- View transitions for smooth page navigation
- Content Collections for typed, validated team/group data
- API routes with 5-minute caching for matches and rankings
- N+1 query optimized with `collectionGroup` (80% Firestore read reduction)

**Performance Optimizations:**
- DNS preconnect for Firebase endpoints
- Font preloading for all Inter weights
- Web Vitals monitoring (LCP, CLS, INP, FCP)
- Client prerender for faster navigation

## 🛠 Tech Stack

- **Astro 6** - Frontend framework (static + islands architecture)
- **React 19** - UI components (islands for interactivity)
- **Firebase** - Auth, Firestore, Hosting, Cloud Messaging
- **Firebase Admin** - Server-side utilities (ready for SSR)
- **Zustand** - State management
- **TypeScript** - Type safety
- **Zod** - Content collection validation
- **Vitest** - Testing (356 tests)
- **ESLint + Prettier** - Code quality
- **Husky + Commitlint** - Git hooks
- **Storybook** - Component documentation

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm lint` | Lint code |
| `pnpm lint:fix` | Lint and fix |
| `pnpm format` | Format code |
| `pnpm storybook` | Start Storybook dev server |
| `pnpm seed` | Seed Firestore with tournament data |
| `pnpm set-admin <uid>` | Promote user to admin |
| `node scripts/generate-content.mjs` | Generate content collection files |

## 🎨 Design System

Atomic Design methodology with retro pixel art aesthetic:
- Sharp corners (no border-radius)
- Blocky shadows (`4px 4px 0px`)
- Pixel borders (4px solid)
- Press Start 2P font for headings
- 8-bit inspired color palette
- Light/dark theme support

## 📱 PWA Features

The app is a Progressive Web App that can be installed on mobile devices.

### Installation
1. Open the app in a supported browser (Chrome, Safari, Edge)
2. Tap "Add to Home Screen" or click the "Install App" button
3. The app will be installed like a native app

### Push Notifications
1. Open the app and log in
2. Click "Enable Notifications" in the PWA install banner
3. Allow notifications when prompted by the browser
4. You'll receive push notifications for match results, badges, and ranking changes

### Offline Support
- Cached pages work offline
- Assets (fonts, icons, styles) are cached automatically
- API responses gracefully handle offline state

### Environment Variables for PWA

```env
# Firebase Cloud Messaging (required for push notifications)
VITE_FIREBASE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

To get the VAPID public key:
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web configuration", click "Generate key pair"
3. Copy the **Public key** value (never expose the private key)

## 🌐 i18n Support

- Spanish (`es`) at `/` (default locale)
- English (`en`) at `/en/`
- All UI strings in `src/locales/`
- Type-safe translations via `src/utils/i18n.ts`
- Centralized nav links generation

## 🔌 API Routes

| Endpoint | Description | Caching |
|----------|-------------|---------|
| `/api/matches` | Get matches (filter by status, phase, limit) | 5 min |
| `/api/rankings` | Get rankings (pagination) | 5 min |

## 📊 Content Collections

Typed, validated content with Zod schemas:
- **Teams:** 48 teams with FIFA codes, names, group assignments
- **Groups:** 12 groups with ordering

Generated via `scripts/generate-content.mjs` from seed data.

## 📄 License

MIT
