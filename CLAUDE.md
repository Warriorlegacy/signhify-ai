# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The monorepo uses Turbo for task execution. Run commands from the repository root.

- `pnpm dev` - Start all services (web frontend and backend server) in development mode
- `pnpm build` - Build all applications and packages
- `pnpm test` - Run all tests
- `pnpm lint` - Run ESLint (via Turbo)
- `pnpm typecheck` - Run TypeScript type checking (via Turbo)
- `pnpm clean` - Clean Build outputs (dist, .turbo, etc.)
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting with Prettier

### Individual Service Commands

You can also run commands for specific apps/packages using Turbo filters:

- `pnpm --filter @signhify/web dev` - Start only the web frontend
- `pnpm --filter server dev` - Start only the backend server
- `pnpm --filter @signhify/agents test` - Run tests for the agents package
- `pnpm --filter @signhify/memory lint` - Lint the memory package

### Running a Single Test

To run a single test file or test suite, use Vitest directly:

- In the web app: `pnpm --filter @signhify/web vitest run src/__tests__/stores.test.ts`
- In the agents package: `pnpm --filter @signhify/agents vitest run src/__tests__/exports.test.ts`
- In the memory package: `pnpm --filter @signhify/memory vitest run src/__tests__/store.test.ts`
- In the server: `pnpm --filter server vitest run src/__tests__/health.test.ts`

## Architecture Overview

Signhify AI is a voice-first, multi-agent AI productivity platform with the following high-level architecture:

- **Frontend**: React + Vite + Tailwind CSS web application (`apps/web`)
- **Backend**: Express.js server with MongoDB/Mongoose (`server`)
- **Agents**: Specialized LangChain.js agents organized in `packages/agents`:
  - Nexus: Orchestrator/router (Gemini)
  - Scribe: Writing & summaries (Gemini/Groq)
  - Scout: Web research (Tavily + Gemini)
  - Forge: Code generation (DeepSeek/Gemini)
  - Vault: Memory storage
  - Herald: Notification/announcement agent
  - Vision: Image processing agent
- **Memory**: In-memory storage with embedding utilities (`packages/memory`)
- **Types**: Shared TypeScript interfaces (`packages/types`)
- **3D UI**: Immersive 3D interface using React Three Fiber (`apps/web/src/components/3d`). Refer to `3d.md` for detailed design specifications.

## Project Structure

```
signhify_ai/
├── apps/
│   └── web/                  # React + Vite frontend
├── packages/
│   ├── agents/               # LangChain.js agents (Nexus, Scribe, Scout, Forge, etc.)
│   ├── memory/               # In-memory store and embedding utilities
│   └── types/                # Shared TypeScript interfaces
├── server/                   # Express + MongoDB + Mongoose backend
└── 3d.md                     # Design document for immersive 3D UI
```

Key directories:
- `apps/web/src`: Frontend source code (views, components, stores, hooks)
- `server/src`: Backend source code (routes, models, middleware, services)
- `packages/*/src`: Package source code
- `apps/web/src/components/3d`: 3D scene and orb components
- `apps/web/src/views`: Page views (Landing, Auth, Dashboard, Chat, Settings)
- `apps/web/src/components/chat`: Chat interface components

## Environment Setup

1. Install dependencies: `pnpm install`
2. Copy `server/.env.example` to `server/.env` and fill in:
   - `PORT=4000`
   - `MONGODB_URI=mongodb://localhost:27017/signhify`
   - `JWT_SECRET=<random-secret>`
   - `CORS_ORIGIN=http://localhost:5173`
3. Ensure MongoDB is running (local or remote)
4. Start development: `pnpm dev`

## Important Notes

- The application uses Turborepo for monorepo task management
- TypeScript is used throughout with strict mode
- Tailwind CSS is used for styling in the frontend
- The frontend uses Zustand for state management
- The backend uses Express.js with JWT authentication
- Agents communicate via the backend API
- The 3D interface is optional but core to the immersive experience
- Environment variables must be set for the server to start correctly
- When adding new agents, follow the pattern in `packages/agents/src/*/index.ts`

## Database

- MongoDB is used for persistent storage (users, threads, notes)
- Models are defined in `server/src/models/`
- Ensure MongoDB URI is correctly set in `.env`
- For development, a local MongoDB instance on default port is expected

## Testing Strategy

- Unit tests are written with Vitest
- Frontend tests: `apps/web/src/**/__tests__/*`
- Backend tests: `server/src/**/__tests__/*`
- Package tests: `packages/*/src/**/__tests__/*`
- Run all tests: `pnpm test`
- Run tests for a specific filter: `pnpm --filter <package> test`

## Linting and Formatting

- ESLint and Prettier are configured via Turbo
- Linting runs on `*.ts` and `*.tsx` files
- Formatting can be applied with `pnpm format`
- CI/CD pipelines will fail on linting or type errors

## Building for Production

- `pnpm build` creates optimized builds in:
  - `apps/web/dist` for the frontend
  - `server/dist` for the backend
  - `packages/*/dist` for packages
- The build process includes TypeScript compilation and asset bundling
- For deployment, the built outputs can be served directly

## Render CLI Usage

The Render CLI can be used to deploy and manage the Signhify AI application on Render.com.

### Installation
```bash
npm install -g render-cli
# Verify installation
render --version
```

### Authentication
```bash
render login
```

### Common Commands

#### Deploying
```bash
# Deploy using render.yaml configuration
render deploy

# Deploy a specific service
render services deploy signhify-ai-api
```

#### Environment Variables
```bash
# List environment variables
render services env-vars list signhify-ai-api

# Set an environment variable
render services env-vars set signhify-ai-api KEY="value"

# Delete an environment variable
render services env-vars delete signhify-ai-api KEY
```

#### Logs
```bash
# View logs
render services logs signhify-ai-api

# Follow logs in real-time
render services logs signhify-ai-api --follow
```

#### Service Management
```bash
# List all services
render services list

# Get service details
render services get signhify-ai-api
```

### Integration with Deployment Guides
The Render CLI complements the deployment methods in `DEPLOYMENT_GUIDES.md`:
- Use instead of the web dashboard for deployments
- Ideal for automating deployments in CI/CD pipelines
- Easier environment variable management for scripts
- Works with the existing `render.yaml` and `Dockerfile` configurations