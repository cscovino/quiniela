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
│   ├── atoms/       # Basic building blocks (Button, Input, Badge, etc.)
│   ├── molecules/   # Simple combinations (MatchCard, StatCard, etc.)
│   ├── organisms/   # Complex sections (MatchList, RankingsTable, etc.)
│   └── templates/   # Page layouts
├── layouts/         # Astro layouts
├── pages/           # Astro pages (routing)
├── styles/          # Global CSS + design tokens
├── lib/             # Firebase config, utilities
├── store/           # Zustand stores
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
├── services/        # Firebase service functions
└── test/            # Test setup
```

## 🛠 Tech Stack

- **Astro** - Frontend framework
- **React 19** - UI components (Islands Architecture)
- **Firebase** - Auth, Firestore, Hosting
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

## 🎨 Design System

Atomic Design methodology with retro pixel art aesthetic:
- Sharp corners (no border-radius)
- Blocky shadows (`4px 4px 0px`)
- Pixel borders (4px solid)
- Press Start 2P font for headings
- 8-bit inspired color palette

## 📄 License

MIT
