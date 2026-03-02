# Showme Backend

Node.js + Express + MongoDB backend scaffolding for CSC307 Showme.

## Requirements

- Node.js 20+
- npm
- MongoDB (local Docker or Atlas)

## Environment

Copy `.env.example` to `.env` and set values.

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/showme
TMDB_API_KEY=...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:3000
CLIENT_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
NODE_ENV=development
```

## Local setup (Docker Mongo)

1. Start MongoDB:

```bash
docker compose up -d
```

2. Install dependencies:

```bash
npm install
```

3. Start backend:

```bash
npm run start
```

## Atlas setup

Use the same backend code and change only `MONGODB_URI` in `.env` to your Atlas connection string.

## Run server

```bash
npm run dev
# or
npm run start
```

## Run tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Seed genres

```bash
npm run seed:genres
```

This script fetches `/genre/movie/list` and `/genre/tv/list` from TMDB, merges by TMDB genre id, then upserts by `tmdbId`. It prints inserted/updated counts and is idempotent.

## OAuth notes

- Google OAuth is scaffolded with Passport using `passport.initialize()` only (no `express-session`).
- Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in `.env`.
- In Google Cloud Console, register callback URL:
  `http://localhost:3001/api/auth/google/callback`
- On Google success, backend redirects to `${CLIENT_ORIGIN}/auth/callback?token=<JWT>`.

## API overview

- `GET /health` -> `{ ok: true }`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/tmdb/search?query=...&type=movie|tv&page=1`
- `GET /api/tmdb/:type/:tmdbId`

## Example curl

Health:

```bash
curl http://localhost:3001/health
```

Register:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"Password123!"}'
```

Login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}'
```

Current user:

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Decisions made

- Added `cross-env` to make Jest ESM test script portable across Windows/macOS/Linux.
- `/api/tmdb/:type/:tmdbId` upserts `Film` from TMDB details + credits and stores up to 10 cast members.
- Google OAuth failures use redirect behavior: `${CLIENT_ORIGIN}/auth/callback?error=google_auth_failed`.
