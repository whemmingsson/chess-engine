# Chess Engine Monorepo

A TypeScript chess project split into three parts:

- `chess-engine`: Express API and chess move engine
- `chess-engine-frontend`: React + Vite client for board interaction
- `common`: Shared models/config used by both apps

## Tech Stack

- Backend: Node.js, TypeScript, Express
- Frontend: React, TypeScript, Vite
- Shared code: TypeScript modules imported by backend/frontend

## Core Engine Design

- The game state is managed by the `Engine` class in `chess-engine/src/Engine.ts`.
- Board state is encapsulated in `Board` (`chess-engine/src/Board.ts`) and accessed through public methods.
- Move classification and validation are split into dedicated modules:
  - `chess-engine/src/MoveClassiification.ts`
  - `chess-engine/src/MoveValidation.ts`
- Shared chess domain models are in `common/models`.

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

### 0) Optional monorepo local dev setup (single command)

From the repository root:

```bash
pnpm install
pnpm dev
```

This starts both apps for local development:

- backend (`chess-engine`) on `http://localhost:3000`
- frontend (`chess-engine-frontend`) on `http://localhost:5173`

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
- `AUTO_PROMOTE_TO_QUEEN` (`true` or `false`, default: `false`)

Example:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
ALLOW_CORS_CREDENTIALS=false
DISABLE_PLAY_ORDER=false
AUTO_PROMOTE_TO_QUEEN=false
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
- `GET /targeting-cells/:cell` -> returns all cells currently attacking a given cell
- `GET /preset-keys` -> returns available preset keys
- `POST /move` -> performs a move
- `POST /reset` -> resets game state to the default starting board
- `POST /preset?presetKey=<key>` -> loads a board preset and resets engine state to it

Runner-backed API endpoints:

- `GET /runner/board` -> returns board state from the runner's internal engine
- `GET /runner/valid-targets/:source` -> returns valid target cells from the runner's internal engine
- `POST /runner/reset` -> resets the runner's internal engine state
- `POST /runner/move` -> performs the player move, then the runner bot move

Example move payload:

```json
{
  "source": "E2",
  "target": "E4"
}
```

Example preset request:

```http
POST /preset?presetKey=LonelyPawn
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
- Engine presets are configured in `chess-engine/src/EnginePresets.ts`.
- The frontend consumes backend endpoints from `chess-engine-frontend/src/service/BoardService.ts`.
