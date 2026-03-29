# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (default: http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

To run a single test file:
```bash
npx vitest run src/services/AuthService.test.js
```

The app expects a backend at `http://localhost:3000/api/` by default (configurable via `VITE_BACKEND_URL`).

## Architecture

### Overview
React 19 SPA for movie discovery — users swipe to like/reject movies, build a watchlist, and chat with an AI assistant (Movio). Built with Vite, TypeScript (mixed TS/JSX codebase), TailwindCSS v4, and React Router v7.

### State Management — Three Context Providers
All providers are nested in `App.jsx` and wrap the entire app:

1. **`AuthProvider`** (`src/providers/AuthProvider.tsx`) — auth status, current user, login/register/logout. Auto-checks session on mount via `auth/check`.
2. **`WatchlistProvider`** (`src/providers/WatchlistProvider.tsx`) — `likedMovies`, `rejectedMovies`, like/reject/remove actions. On login, syncs guest watchlist to server via `addBulkToWatchlist`.
3. **`MovieFeedProvider`** (`src/providers/MovieFeedProvider.tsx`) — the queue of movies for swiping, feed position, and pagination.

### Services Layer
All API calls go through class-based services in `src/services/`. Each service uses a `fetchWithTimeout()` helper (AbortController-based) with `credentials: 'include'` for cookie auth. Services throw descriptive errors using server-provided messages when available.

- `auth.ts` — register, login, logout, check session
- `movies.ts` — TMDB-proxied movie data (recommendations, popular, genres, details)
- `watchlist.ts` — CRUD for user watchlist + bulk add for guest sync
- `agent.ts` — OpenAI chat proxy (30s timeout)
- `recommendations.ts` — movie recommendations endpoint

### Authentication
JWT + HttpOnly cookies. The backend sets the cookie; the frontend just sends `credentials: 'include'` with every request. Session persists across page refreshes via `GET /auth/check` on app load.

### Path Aliases
Configured in both `vite.config.js` and `tsconfig.json`. Use these instead of relative paths:
`@/`, `@components/`, `@services/`, `@hooks/`, `@providers/`, `@icons`, `@pages/`, `@helpers/`, `@types/`

### Testing
- Vitest + React Testing Library + JSDOM
- `src/tests/setupTests.js` — imports jest-dom matchers, mocks `global.fetch` with `vi.fn()`
- Unit tests are co-located with source files (`*.test.js` / `*.test.jsx`)
- Integration tests live in `src/tests/integrations/`

### Deployment
CI runs on GitHub Actions: lint → test (3 retries) → build. Production deploys to AWS S3 + CloudFront invalidation. Vercel config (`vercel.json`) rewrites API calls to the Railway-hosted backend.
