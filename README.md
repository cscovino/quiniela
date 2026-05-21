# 🎮 Quiniela

Retro Pixel Art Football Prediction App built with Astro + React + Firebase.

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
│   ├── atoms/       # Basic building blocks (Button, Input, Badge, Toast, etc.)
│   ├── molecules/   # Simple combinations (MatchCard, StatCard, PointsChart, etc.)
│   ├── organisms/   # Complex sections (MatchList, RankingsTable, NavBar, PWAInstall, etc.)
│   └── templates/   # Page layouts
├── layouts/         # Astro layouts
├── pages/           # Astro pages (routing)
├── styles/          # Global CSS + design tokens
├── lib/             # Firebase config, utilities
├── store/           # Zustand stores (auth, toast)
├── hooks/           # Custom React hooks
├── types/           # TypeScript types (firestore, badges)
├── services/        # Firebase service functions (auth, firestore, fcm)
└── test/            # Test setup
public/
├── icons/           # PWA icons (72x72 to 512x512)
├── screenshots/     # PWA screenshots
├── manifest.json    # Web app manifest
├── sw.js            # Service worker (offline caching)
└── firebase-messaging-sw.js  # FCM background messaging
```

## 🛠 Tech Stack

- **Astro** - Frontend framework
- **React 19** - UI components (Islands Architecture)
- **Firebase** - Auth, Firestore, Hosting, Cloud Messaging
- **Zustand** - State management
- **TypeScript** - Type safety
- **Vitest** - Testing
- **ESLint + Prettier** - Code quality
- **Husky + Commitlint** - Git hooks

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
| `pnpm seed` | Seed Firestore with tournament data |
| `pnpm set-admin <uid>` | Promote user to admin |

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
- All UI strings translated in `src/locales/`

## 📄 License

MIT
