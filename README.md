# Chess Engine Monorepo

A TypeScript chess project split into three parts:

- `chess-engine`: Express API and chess move engine
- `chess-engine-frontend`: React + Vite client for board interaction
- `common`: Shared models/config used by both apps

## Tech Stack

- Backend: Node.js, TypeScript, Express
- Frontend: React, TypeScript, Vite
- Shared code: TypeScript modules imported by backend/frontend

## Project Structure

```text
chess-engine/
  chess-engine/            # API + engine logic
  chess-engine-frontend/   # React UI
  common/                  # Shared types/models/config
```

## Prerequisites

- Node.js 18+
- pnpm

## Quick Start

### 1) Install dependencies

From each app directory:

```bash
cd chess-engine
pnpm install

cd ../chess-engine-frontend
pnpm install
```

### 2) Start backend API

```bash
cd chess-engine
pnpm dev
```

Default backend URL: `http://localhost:3000`

### 3) Start frontend

In a second terminal:

```bash
cd chess-engine-frontend
pnpm dev
```

Default frontend URL: `http://localhost:5173`

## Environment Variables

### Backend (`chess-engine`)

The backend reads environment variables from `.env`.

- `PORT` (default: `3000`)
- `FRONTEND_ORIGIN` (default: `http://localhost:5173`)
- `ALLOW_CORS_CREDENTIALS` (`true` or `false`, default: `false`)
- `DISABLE_PLAY_ORDER` (`true` or `false`, default: `false`)

Example:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
ALLOW_CORS_CREDENTIALS=false
DISABLE_PLAY_ORDER=false
```

### Frontend (`chess-engine-frontend`)

Optional Vite env var:

- `VITE_API_BASE_URL` (default: `http://localhost:3000`)

Example:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## API Endpoints

Base URL: `http://localhost:3000`

- `GET /health` -> returns API status
- `GET /board` -> returns current board state
- `GET /valid-targets/:source` -> returns valid target cells for a source cell (example: `A2`)
- `POST /move` -> performs a move

Example move payload:

```json
{
  "source": "E2",
  "target": "E4"
}
```

`POST /move` response:

- Success (`200`):

```json
{
  "success": true,
  "board": {
    "A1": { "color": "White", "class": "Rook", "shortClass": "R" }
  }
}
```

- Invalid move (`400`):

```json
{
  "success": false,
  "message": "Move failed"
}
```

## Scripts

### Backend scripts (`chess-engine/package.json`)

- `pnpm dev`: run API in watch mode with `tsx`
- `pnpm dev:debug`: run `Driver.ts` in watch mode
- `pnpm build`: compile TypeScript with `tsc`
- `pnpm start`: run compiled backend
- `pnpm clean`: remove `dist`

### Frontend scripts (`chess-engine-frontend/package.json`)

- `pnpm dev`: run Vite dev server
- `pnpm build`: type-check and create production build
- `pnpm preview`: preview production build
- `pnpm lint`: run ESLint

## Development Notes

- The starting piece layout is defined in `common/config/board-config.ts`.
- Shared move/piece models live in `common/models`.
- Backend CORS defaults are configured for local frontend development.
