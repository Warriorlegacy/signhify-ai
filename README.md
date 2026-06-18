# Signhify AI

> Type less. Signhify everything.

A self-improving, model-agnostic personal AI assistant with persistent memory, skill generation, multi-provider LLM support, and a rich CLI/TUI.

---

## Features

- **Multi-LLM Provider Support** — OpenAI, Anthropic, Groq, OpenRouter, Gemini with automatic fallback and hot-swap
- **Persistent Memory** — MongoDB-backed episodes, facts, and user profiles with semantic search
- **Skill Generation** — Auto-detect and synthesize reusable skills from conversation patterns
- **Agent Orchestration** — 7 specialized agents (Nexus, Scribe, Scout, Forge, Vault, Herald, Vision)
- **Gateway Integrations** — Telegram and Discord bots with memory context injection
- **Task Scheduling** — Cron-based scheduling with retry logic and memory context
- **CLI + TUI** — Rich command-line interface with interactive terminal REPL
- **Observability** — OpenTelemetry tracing and metrics (opt-in)
- **Production Ready** — Docker, Redis caching, rate limiting, health checks, graceful shutdown

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ACCESS LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Web UI  │  │ Telegram │  │ Discord  │  │  CLI / TUI │  │
│  │ (React)  │  │ Gateway  │  │ Gateway  │  │            │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       └──────────────┼─────────────┼──────────────┘          │
│                      └──────┬──────┘                          │
│                    ┌────────▼────────┐                        │
│                    │  Express API    │                        │
│                    │  (Auth, SSE)    │                        │
│                    └────────┬────────┘                        │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                  ORCHESTRATION LAYER                          │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Scheduler │  │ Skill        │  │ Memory Manager       │  │
│  │ (cron)    │  │ Registry     │  │ (episodes, facts,    │  │
│  │           │  │              │  │  profiles, search)   │  │
│  └───────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                PROVIDER ABSTRACTION LAYER                     │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ ┌───────┐ │
│  │ OpenAI │ │Anthropic │ │  Groq  │ │OpenRouter│ │Gemini │ │
│  └────────┘ └──────────┘ └────────┘ └──────────┘ └───────┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   PERSISTENCE LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │ MongoDB  │  │  Redis   │  │  Vector Embeddings       │   │
│  │ (data)   │  │ (cache)  │  │  (semantic search)       │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Agents

| Agent  | Role                       | Capabilities                                 |
| ------ | -------------------------- | -------------------------------------------- |
| Nexus  | Intent router              | Classifies user intent, routes to specialist |
| Scribe | Writing & summaries        | Long-form content, editing, summaries        |
| Scout  | Web research               | Real-time web search, citations              |
| Forge  | Code generation            | Write, debug, refactor code                  |
| Vault  | Personal knowledge base    | Save, retrieve, search user data             |
| Herald | Communication & scheduling | Draft emails, reminders, notifications       |
| Vision | Image analysis             | Describe, analyze images                     |

---

## Project Structure

```
signhify-ai/
├── apps/
│   └── web/                    # React + Vite + Tailwind frontend
├── packages/
│   ├── agents/                 # LLM adapters, provider manager, agent runners
│   │   └── src/adapters/       # OpenAI, Anthropic, Groq, OpenRouter, Gemini
│   ├── memory/                 # Embeddings, cosine similarity, in-memory store
│   ├── types/                  # Shared TypeScript interfaces
│   └── cli/                    # CLI tool (signhify command)
├── server/
│   ├── src/
│   │   ├── lib/                # Redis, logger, env validation, telemetry
│   │   ├── middleware/          # Auth, BYOK, rate limiting, error handler
│   │   ├── models/             # Mongoose schemas (User, Thread, Skill, Memory*)
│   │   ├── routes/             # API routes (auth, agents, memory, skills, etc.)
│   │   └── services/           # MemoryManager, SkillRegistry, Scheduler
│   └── .env.example
├── docker-compose.yml          # MongoDB + Redis + App
├── Dockerfile                  # Multi-stage production build
└── package.json                # Root workspace config
```

---

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 10
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your settings:

```env
# Required
JWT_SECRET=your-secret-at-least-32-chars
MONGODB_URI=mongodb://localhost:27017/signhify

# Server
PORT=4000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

# Redis (optional)
REDIS_URL=redis://localhost:6379

# LLM Providers (at least one)
GEMINI_API_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=

# Gateways (optional)
TELEGRAM_BOT_TOKEN=
DISCORD_BOT_TOKEN=
```

### 3. Start development

```bash
# Start all services (web + server)
pnpm dev

# Or start individually
pnpm dev --filter web     # Vite on :5173
pnpm dev --filter server  # Express on :4000
```

### 4. Open the web UI

Navigate to `http://localhost:5173`

---

## Docker Deployment

### Production with Docker Compose

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f app

# Stop
docker compose down
```

This starts:

- **MongoDB** on port 27017
- **Redis** on port 6379
- **App** on port 80 (mapped from 4000)

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URI=mongodb://mongo:27017/signhify
REDIS_URL=redis://redis:6379
CORS_ORIGIN=https://your-domain.com
```

---

## CLI Usage

### Install globally

```bash
npm install -g .
# or
pnpm link --global
```

### Commands

```bash
# Authentication
signhify config              # Set server URL
signhify login               # Login with email/password

# Chat with agents
signhify ask "What's the weather?"
signhify ask "Write a haiku" --thread <id>

# Interactive TUI
signhify tui

# Memory
signhify memory list         # List vault notes
signhify memory add "key" "value" -t "tag1,tag2"
signhify recall search "query"
signhify recall context "query"
signhify recall stats
signhify recall fact list

# Skills
signhify skills list
signhify skills approve <id>
signhify skills reject <id>

# Scheduling
signhify schedule list
signhify schedule add "name" "0 9 * * *" "prompt"
signhify schedule status
signhify schedule toggle <id>

# Profile
signhify profile

# Status
signhify status

# Threads
signhify threads list
signhify threads create "title"
```

---

## API Endpoints

### Auth

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | Login             |

### Agents

| Method | Endpoint         | Description                   |
| ------ | ---------------- | ----------------------------- |
| POST   | /api/agents/chat | Chat with agents (SSE stream) |

### Memory

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | /api/memory/episodes | List episodes        |
| POST   | /api/memory/episodes | Add episode          |
| POST   | /api/memory/search   | Semantic search      |
| GET    | /api/memory/context  | Get relevant context |
| GET    | /api/memory/facts    | List facts           |
| POST   | /api/memory/facts    | Add/update fact      |
| GET    | /api/memory/stats    | Memory statistics    |
| GET    | /api/profile         | Get user profile     |

### Skills

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | /api/skills             | List skills          |
| POST   | /api/skills             | Create skill         |
| POST   | /api/skills/:id/approve | Approve skill        |
| POST   | /api/skills/:id/reject  | Reject skill         |
| POST   | /api/skills/match       | Match skill to input |

### Scheduling

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | /api/schedule            | List scheduled tasks |
| POST   | /api/schedule            | Create task          |
| PATCH  | /api/schedule/:id/toggle | Toggle enabled       |
| GET    | /api/schedule/status     | Scheduler status     |

### Other

| Method | Endpoint     | Description   |
| ------ | ------------ | ------------- |
| GET    | /api/health  | Health check  |
| GET    | /api/notes   | List notes    |
| POST   | /api/notes   | Create note   |
| GET    | /api/threads | List threads  |
| POST   | /api/threads | Create thread |

---

## Development

### Commands

```bash
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm typecheck        # Type-check all packages
pnpm lint             # Lint all packages
pnpm format           # Format with Prettier
pnpm clean            # Clean all dist folders
```

### Quality Gate

```bash
pnpm typecheck && pnpm lint && pnpm build && pnpm test
```

### Single Package

```bash
pnpm --filter @signhify/server build
pnpm --filter @signhify/agents test
pnpm --filter @signhify/memory vitest run
```

---

## Configuration

### LLM Providers

The system automatically selects the best available provider with this priority:

1. **Groq** (fastest inference)
2. **OpenAI** (GPT-4o)
3. **Anthropic** (Claude)
4. **OpenRouter** (multi-model)
5. **Gemini** (fallback)

Users provide their own keys via BYOK (Bring Your Own Key) in the web UI settings, or system keys can be set in `.env` for scheduled tasks.

### Memory System

- **Episodes**: Conversation summaries with embeddings for semantic search
- **Facts**: Key-value pairs with confidence scores and TTL
- **Profiles**: User preferences, projects, recurring tasks, important people
- **Context Injection**: Relevant memories are automatically injected into agent prompts

### Observability

Set `OTEL_ENABLED=true` to enable OpenTelemetry tracing and metrics. Configure `OTEL_EXPORTER_OTLP_ENDPOINT` for OTLP export.

---

## Tech Stack

| Layer         | Technology                                     |
| ------------- | ---------------------------------------------- |
| Frontend      | React 19, Vite, Tailwind CSS v4, Zustand       |
| Backend       | Express, Mongoose, node-cron                   |
| LLM Framework | LangChain.js (OpenAI, Anthropic, Groq, Gemini) |
| Database      | MongoDB 7                                      |
| Cache         | Redis 7                                        |
| CLI           | Commander, Inquirer, Chalk, Ora                |
| Build         | Turborepo, pnpm, TypeScript                    |
| Observability | OpenTelemetry (opt-in)                         |
| Deployment    | Docker, Docker Compose                         |

---

## License

MIT
