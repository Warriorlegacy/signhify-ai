# AGENTS.md — Signhify AI

## Monorepo shape
- **Workspaces**: `apps/web`, `server`, `packages/{agents,memory,types}`
- **Task runner**: Turborepo via pnpm (`packageManager: pnpm@10.10.0`, `engines: node >=20`)
- `apps/web` does **not** extend `tsconfig.base.json`; it is standalone (`module: ESNext`, `moduleResolution: bundler`, `noEmit: true`, Vite-driven).

## Build order matters
Turborepo `build` / `typecheck` use `dependsOn: ["^build"]`, so the real order is:

```
types → memory → agents → server → web
```

`pnpm build` enforces this transitively. Do not run package builds independently and expect order correctness.

## Exact commands
```bash
pnpm install            # workspace install
pnpm dev                 # all services (web + server)
pnpm dev --filter web    # web only (Vite :5173)
pnpm dev --filter server # server only (Express)

# Quality gate order in CI: typecheck → lint → build → test
pnpm typecheck
pnpm lint
pnpm build
pnpm test

# Single package
pnpm --filter @signhify/memory test
# Single test file
pnpm --filter @signhify/agents vitest run src/__tests__/exports.test.ts
```

## Server configuration
- **Required env**: `JWT_SECRET`, `MONGODB_URI` (fails fast on missing)
- **Optional env**: `PORT` (default `3001`), `CORS_ORIGIN` (default `http://localhost:5173`), `NODE_ENV`
- Setup: `cp server/.env.example server/.env` — file is committed with placeholder values; replace with real secrets.
- **Port mismatch risk**: web Vite proxy targets `http://localhost:3001`, but `server/.env` sets `PORT=4000`. Align them before running both.

## MongoDB
- Required for server runtime. Docker: `docker compose up -d` (Mongo 7 + app, ports `27017` / `4000`).
- Local fallback: `mongodb://localhost:27017/signhify` (from `.env`).

## Test / lint quirks
- No root `vitest.config.ts`. Web test config lives in `apps/web/vite.config.ts` (`environment: jsdom`). Other packages have no explicit vitest config.
- `server/lint` and `server/typecheck` are the **same command** (`tsc --noEmit`). There is no ESLint step for the server.
- `apps/web/lint` and `apps/web/typecheck` are also both `tsc --noEmit`.
- No root Tailwind config; `apps/web` uses Tailwind v4 via `@tailwindcss/vite` plugin.
- Tests on server routes that touch Mongoose need MongoDB running.

## Dockerfile gotchas
- Production Docker uses **pnpm 9.15.0** (CI/local uses 10.10.0). The two-pattern `pnpm` versioning is intentional in the image but confusing locally.
- `docker compose` sets `PORT=4000` and overrides `MONGODB_URI` to `mongodb://mongo:27017/signhify` (internal service name).

## Internal package references
Use `workspace:*`:

```json
"@signhify/types": "workspace:*",
"@signhify/memory": "workspace:*",
"@signhify/agents": "workspace:*"
```

## Entrypoints
- Web: `apps/web/src/main.tsx`
- Server: `server/src/index.ts` (registers `/api/auth`, `/api/agents`, `/api/threads`, `/api/users`, `/api/notes`)
- Embedded docs: `CLAUDE.md` contains detailed architecture notes (agents map, folder map) — keep it updated in sync, do not duplicate here.
