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

## Run with Docker

- `docker compose up --build` — build the image and serve the app on `http://localhost:4200`
- `docker compose down` — stop and remove the container

The container builds with Node 20 and serves the static `dist/` via `nginx:alpine`. The backend at `http://localhost:5000/api` must be reachable from the host.
