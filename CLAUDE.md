# CLAUDE.md — AI Assistant Guide for word-tour

## Project Overview

**word-tour** is a full-stack, golf-themed word-guessing game where players compete across 18 "holes" of word puzzles. Each hole unlocks daily, and scores map to golf terminology (Hole-in-One, Eagle, Birdie, Par, Bogey, Double Bogey). Supports multiplayer, public/private games, custom word themes, and daily leaderboards.

**License**: CC0 1.0 Universal (public domain)

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 19, TypeScript, Vite 7, React Router 7      |
| UI        | React Bootstrap 2 + Bootstrap 5, custom CSS vars   |
| Backend   | Express 5, Node.js                                 |
| Database  | SQLite via better-sqlite3                          |
| Auth      | bcryptjs (password hashing), express-session       |
| Utilities | date-fns, uuid                                     |
| Dev tools | ESLint 9, tsx (server hot-reload), TypeScript 5.9  |

## Repository Structure

```
word-tour/
├── server/
│   ├── db.ts                    # SQLite schema & initialization
│   └── index.ts                 # Express API (auth, games, results, users)
├── src/
│   ├── components/
│   │   ├── common/              # Avatar, AvatarPicker, ProtectedRoute
│   │   ├── game/                # WordleBoard, Keyboard, GolfScorecard, HoleNavigator
│   │   └── layout/              # Navbar, Footer, Layout
│   ├── context/
│   │   ├── AuthContext.tsx       # User auth state, login/signup/logout
│   │   ├── GameContext.tsx       # Game CRUD, round management, results
│   │   └── ThemeContext.tsx      # Light/dark mode toggle
│   ├── data/
│   │   ├── wordLists.ts         # Themed word lists by category and length
│   │   └── avatars.ts           # Avatar SVG definitions
│   ├── pages/                   # Route-level page components
│   ├── styles/
│   │   └── theme.css            # All custom CSS (variables, dark mode, responsive)
│   ├── types/
│   │   └── index.ts             # All TypeScript type definitions
│   ├── utils/
│   │   ├── api.ts               # HTTP client (all fetch requests to backend)
│   │   ├── gameLogic.ts         # Word evaluation, scoring, constraints
│   │   ├── pexels.ts            # Pexels API for golf course hero images
│   │   └── storage.ts           # LocalStorage helpers
│   ├── App.tsx                  # Root component with routing
│   └── main.tsx                 # React entry point
├── tests/
│   └── gameLogic.test.ts        # Unit tests for core game logic
├── index.html                   # HTML shell
├── package.json
├── vite.config.ts               # Vite config (dev server proxy to :3001)
├── tsconfig.json
├── docker-compose.yml           # Docker deployment config
├── CLAUDE.md                    # This file
├── README.md                    # User-facing documentation
└── LICENSE
```

## Development Commands

```bash
npm run dev          # Start Vite frontend dev server (port 5173)
npm run dev:server   # Start Express API server (port 3001) with hot-reload
npm run dev:all      # Start both concurrently
npm run build        # TypeScript compile + Vite production build
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

## Architecture

### State Management
Three React Context providers — no Redux or external state library:
- **AuthContext** — user session, login/signup/logout, all-users list
- **GameContext** — game CRUD, round words, results, invitations
- **ThemeContext** — light/dark toggle persisted to localStorage

### Routing
React Router v7 with `BrowserRouter`. Protected routes wrap pages in `<ProtectedRoute>` (redirects to `/login` if unauthenticated).

| Route                     | Page                | Protected |
|---------------------------|---------------------|-----------|
| `/`                       | HomePage            | No        |
| `/login`                  | LoginPage           | No        |
| `/signup`                 | SignupPage          | No        |
| `/dashboard`              | DashboardPage       | Yes       |
| `/create-game`            | CreateGamePage      | Yes       |
| `/game/:gameId`           | GamePlayPage        | Yes       |
| `/game/:gameId/results`   | GameResultsPage     | Yes       |
| `/profile`                | ProfilePage         | Yes       |
| `/leaderboard`            | LeaderboardPage     | Yes       |
| `/daily`                  | DailyLeaderboardPage| Yes       |

### Styling Approach
- Single CSS file: `src/styles/theme.css`
- CSS custom properties (variables) for theming
- Dark mode via `[data-theme="dark"]` attribute on root element
- Mobile-first responsive design with breakpoints at 768px, 576px, 370px
- Gameplay page: dynamic tile/keyboard sizing with `clamp()`, hides navbar/footer on mobile

### Backend API
Express server at `server/index.ts` with SQLite persistence. Key endpoint groups:
- `/api/auth/*` — register, login, logout, session restore
- `/api/users/*` — list users, get user by ID
- `/api/games/*` — CRUD, join, words, start words, results

### Game Logic
Core logic in `src/utils/gameLogic.ts` (testable independently of UI):
- `evaluateGuess()` — compare guess to target, return letter statuses
- `generateRoundWords()` — pick words for 18 holes based on config
- `pickStartWord()` — select forced first guess from theme
- `calculateHoleScore()` — map guess count to golf score name
- `getHoleAvailability()` — determine if a hole is playable today

## Key Domain Concepts

- **Par 3/4/5** maps to 4/5/6-letter words and 5/6/7 max guesses
- **Scoring**: Hole-in-One (1 guess), Eagle (par-2), Birdie (par-1), Par, Bogey (par+1), Double Bogey (par+2 or fail)
- **Word modes**: Classic Daily (uses the official NYT daily word via its public feed) or Custom (themed categories)
- **Start words**: Forced first guess — configurable per front 9 / back 9 (none, from theme, or custom per hole)
- **Winner Picks**: Optional rule where the hole winner sets constraints for the next hole
- **Daily unlock**: One hole per day at midnight local time

## Conventions

- **Commits**: Use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- **Types**: All TypeScript types centralized in `src/types/index.ts`
- **Components**: Organized by role — `common/`, `game/`, `layout/` under `src/components/`
- **Pages**: One file per route in `src/pages/`
- **API calls**: All HTTP requests go through `src/utils/api.ts` — components never call `fetch` directly
- **No inline styles** preferred — use CSS variables and classes from `theme.css`
- **Game logic separated from UI** — pure functions in `utils/gameLogic.ts`, tested in `tests/`

## Testing

```bash
# Run game logic tests (uses Node.js built-in test runner)
node --experimental-vm-modules node_modules/.bin/jest tests/gameLogic.test.ts
```

Tests cover: guess evaluation, scoring, word generation, constraint validation.
