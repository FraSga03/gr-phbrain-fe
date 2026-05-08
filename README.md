# Gr@phBRAIN Frontend

React 19 + TypeScript + Vite single-page app. Talks to a backend at `http://localhost:5000/api`.

## Requirements

- Node.js **20.x**
- npm 10+

## Run locally

- `npm install` — install dependencies
- `npm run dev` — start dev server on `http://localhost:4200`
- `npm run build` — typecheck and produce a production build in `dist/`
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## Environment variables

Create a `.env` (or `.env.development` / `.env.production`) at the repo root. Only `VITE_`-prefixed vars reach the client and are inlined at build time — rebuild after changes.

- `VITE_API_BASE_URL` — backend API base URL (default `http://localhost:5000/api`)

## Run with Docker

- `docker compose up --build` — build the image and serve the app on `http://localhost:4200`
- `docker compose down` — stop and remove the container

The container builds with Node 20 and serves the static `dist/` via `nginx:alpine`. The backend at `http://localhost:5000/api` must be reachable from the host.
