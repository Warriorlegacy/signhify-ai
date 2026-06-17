# Signhify AI - Agent Guide

## Structure
- Monorepo with Turborepo + pnpm
- Workspace: `apps/web`, `server`, `packages/{agents,memory,types}`
- All tsconfigs extend `tsconfig.base.json` (5.6.0, strict, commonjs)

## Development Commands
```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all services (turbo dev)
pnpm build            # Build all packages (turbo build)
pnpm typecheck        # TypeScript check all packages (turbo typecheck)
pnpm lint             # Lint all packages (turbo lint)
pnpm test             # Test all packages (turbo test)
pnpm format           # Prettier write
pnpm format:check     # Prettier check
```

## Build Order (Critical)
Packages must build in order: `types` → `memory` → `agents` → `server` → `web`
(Turborepo handles this via `dependsOn: ["^build"]`)

## Environment Setup
```bash
cp server/.env.example server/.env
# Fill in: JWT_SECRET, MONGODB_URI, CORS_ORIGIN
```
Server validates `JWT_SECRET` and `MONGODB_URI` on startup (fails fast).

## Docker (includes MongoDB)
```bash
docker compose up -d
```

## Testing
- Each package runs `vitest run` (no root vitest.config.ts)
- Run single package: `pnpm --filter @signhify/agents test`

## Gotchas
- Web tsconfig uses `moduleResolution: bundler` (ES modules)
- Server tsconfig uses `moduleResolution: node` (CommonJS)
- `apps/web/lint` and `apps/web/typecheck` both run `tsc --noEmit`
- No root vitest/tailwind configs; each package provides its own if needed