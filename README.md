# Signhify AI

> Type less. Signhify everything.

A voice-first, multi-agent AI productivity platform. Delegate tasks to specialized AI agents through a single chat interface.

## Architecture

```
apps/
  web/          - React + Vite + Tailwind CSS frontend
packages/
  agents/       - LangChain.js agents (Nexus, Scribe, Scout, Forge)
  memory/       - In-memory store and embedding utilities
  types/        - Shared TypeScript interfaces
server/         - Express + MongoDB + Mongoose backend
```

## Agents

| Agent  | Role                | Powered By        |
| ------ | ------------------- | ----------------- |
| Nexus  | Orchestrator/router | Gemini            |
| Scribe | Writing & summaries | Gemini / Groq     |
| Scout  | Web research        | Tavily + Gemini   |
| Forge  | Code generation     | DeepSeek / Gemini |

## Development

```bash
# Install dependencies
pnpm install

# Start all services (web + server)
pnpm dev

# Lint & typecheck
pnpm typecheck
pnpm lint

# Build
pnpm build
```

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- MongoDB (local or remote)

### Environment

Copy `server/.env.example` to `server/.env` and fill in:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/signhify
JWT_SECRET=<random-secret>
CORS_ORIGIN=http://localhost:5173
```

## Docker

```bash
docker compose up -d
```

## License

MIT
