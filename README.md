# Signhify AI

> Type less. Signhify everything.

A self-improving, model-agnostic personal AI workspace with 7 specialized agents, persistent memory, skill generation, and multi-provider LLM support.

**[Live Demo](https://signhify-ai.onrender.com)** · **[Report Bug](https://github.com/Warriorlegacy/signhify-ai/issues)** · **[Request Feature](https://github.com/Warriorlegacy/signhify-ai/issues)**

---

## What is Signhify?

Signhify is an open-source AI workspace where 7 specialized agents collaborate to get work done. It learns your patterns, builds reusable skills automatically, and remembers everything across sessions.

- **Self-Learning** — Agents detect reusable patterns from conversations and create skills
- **Persistent Memory** — MongoDB-backed episodic memory, facts, and user profiles
- **Multi-Provider BYOK** — OpenAI, Anthropic, Groq, Gemini, OpenRouter — no vendor lock-in
- **Always-On** — Cron scheduling, proactive automation, 24/7 operation
- **Multi-Channel** — Telegram and Discord bots with memory context injection
- **Open Source** — MIT license, self-host, full data ownership

---

## Installation

### Prerequisites

| Requirement | Minimum | Recommended                 |
| ----------- | ------- | --------------------------- |
| Node.js     | v20.0+  | v22 LTS                     |
| pnpm        | v10+    | v10.10                      |
| MongoDB     | 7.0+    | MongoDB Atlas (free tier)   |
| Redis       | 7.0+    | Optional (improves caching) |

### Option 1: Local Development (Recommended for getting started)

```bash
# 1. Clone the repository
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp server/.env.example server/.env
```

Edit `server/.env` with your settings:

```env
# Required — generate a random secret
JWT_SECRET=your-random-secret-at-least-32-characters-long

# Required — use local MongoDB or Atlas
MONGODB_URI=mongodb://localhost:27017/signhify

# Server
PORT=4000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

```bash
# 4. Start MongoDB (if running locally)
# Option A: Docker
docker run -d -p 27017:27017 --name signhify-mongo mongo:7

# Option B: Local MongoDB service
# mongod --dbpath /data/db

# 5. Start the development server
pnpm dev
```

Open **http://localhost:5173** in your browser.

### Option 2: Docker Compose (One command)

```bash
# Clone and start everything
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai

# Create your environment file
cp server/.env.example server/.env
# Edit server/.env with your JWT_SECRET

# Start MongoDB + Redis + App
docker compose up -d --build

# View logs
docker compose logs -f app
```

This starts:

- **MongoDB** on port `27017`
- **Redis** on port `6379`
- **App** on port `80`

Open **http://localhost** in your browser.

### Option 3: Production Deployment

#### Render.com (Free Tier)

1. Fork the repo on GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your fork — Render reads `render.yaml` automatically
4. Set environment variables in Render dashboard:
   - `JWT_SECRET` — random string (use a password generator)
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `CORS_ORIGIN` — your Render app URL (e.g., `https://signhify-ai.onrender.com`)
5. Deploy — takes ~3 minutes

#### Railway

1. Fork the repo on GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a MongoDB service (Railway has a MongoDB plugin)
4. Set environment variables in the Variables tab
5. Deploy

#### Vercel (Frontend) + Railway (Backend)

1. Deploy the frontend from `apps/web/` to Vercel
2. Deploy the server from `server/` to Railway
3. Set `CORS_ORIGIN` to your Vercel URL
4. Update the Vite proxy or use environment variables for the API URL

---

## Getting Your API Keys

Signhify uses a **BYOK (Bring Your Own Key)** model. You provide your own API keys — no subscription required.

### Free Options

| Provider          | How to Get a Key                                          | Cost                  |
| ----------------- | --------------------------------------------------------- | --------------------- |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com/apikey) | Free tier available   |
| **Groq**          | [console.groq.com](https://console.groq.com/keys)         | Free tier available   |
| **OpenRouter**    | [openrouter.ai](https://openrouter.ai/keys)               | Free models available |

### Paid Options

| Provider      | How to Get a Key                                                     | Cost          |
| ------------- | -------------------------------------------------------------------- | ------------- |
| **OpenAI**    | [platform.openai.com](https://platform.openai.com/api-keys)          | Pay per token |
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com/settings/keys) | Pay per token |

### Adding Keys

**Method 1: Web UI (Recommended)**

1. Open the app → Settings → API Keys
2. Paste your key(s) — they're stored locally in your browser

**Method 2: Environment Variables**
Add to `server/.env` for system-level access (used by scheduled tasks):

```env
GEMINI_API_KEY=your-key-here
GROQ_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
```

---

## Using Signhify

### First Time Setup

1. Open the app → Click **"Get Started Free"**
2. Create an account (email + password)
3. The onboarding wizard guides you through:
   - Connecting an AI provider
   - Meeting your 7 agents
   - Setting up channels
4. Start chatting!

### Keyboard Shortcuts

| Shortcut                | Action               |
| ----------------------- | -------------------- |
| `Cmd+K` / `Ctrl+K`      | Open command palette |
| `Cmd+1` through `Cmd+5` | Switch between views |
| `Enter`                 | Send message         |
| `Esc`                   | Close modals         |

### Chat Commands

Just type naturally — Nexus (the router agent) will direct your request to the right specialist:

```
Research the latest AI developments
Write a blog post about React 19
Generate a Python data pipeline
Save this to my memory vault
Schedule a daily briefing at 9am
```

### Agents

| Agent      | What It Does                               |
| ---------- | ------------------------------------------ |
| **Nexus**  | Routes your intent to the right specialist |
| **Scribe** | Writes content, summaries, and edits       |
| **Scout**  | Researches the web with live citations     |
| **Forge**  | Generates and debugs code                  |
| **Vault**  | Manages your personal knowledge base       |
| **Herald** | Handles communication and scheduling       |
| **Vision** | Analyzes images and screenshots            |

### Memory System

- **Episodes** — Conversation summaries with semantic search
- **Facts** — Key-value pairs with confidence scores
- **Profiles** — Your preferences, projects, and important people
- **Auto-Context** — Relevant memories are injected into agent prompts automatically

### Scheduling

Create recurring tasks using natural language or cron expressions:

```
Schedule a daily standup summary at 9am every weekday
Run a weekly research digest every Monday at 8am
```

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
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   └── services/           # MemoryManager, SkillRegistry, Scheduler
│   └── .env.example
├── docker-compose.yml          # MongoDB + Redis + App
├── Dockerfile                  # Multi-stage production build
└── package.json                # Root workspace config
```

---

## API Reference

### Authentication

| Method | Endpoint             | Description    |
| ------ | -------------------- | -------------- |
| POST   | `/api/auth/register` | Create account |
| POST   | `/api/auth/login`    | Sign in        |

### Chat

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| POST   | `/api/agents/chat` | Chat with agents (SSE stream) |

### Memory

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/api/memory/episodes` | List episodes        |
| POST   | `/api/memory/episodes` | Add episode          |
| POST   | `/api/memory/search`   | Semantic search      |
| GET    | `/api/memory/context`  | Get relevant context |
| GET    | `/api/memory/facts`    | List facts           |
| POST   | `/api/memory/facts`    | Add/update fact      |
| GET    | `/api/memory/stats`    | Memory statistics    |

### Skills

| Method | Endpoint                  | Description   |
| ------ | ------------------------- | ------------- |
| GET    | `/api/skills`             | List skills   |
| POST   | `/api/skills`             | Create skill  |
| POST   | `/api/skills/:id/approve` | Approve skill |
| POST   | `/api/skills/:id/reject`  | Reject skill  |

### Scheduling

| Method | Endpoint                   | Description          |
| ------ | -------------------------- | -------------------- |
| GET    | `/api/schedule`            | List scheduled tasks |
| POST   | `/api/schedule`            | Create task          |
| PATCH  | `/api/schedule/:id/toggle` | Toggle enabled       |

### Other

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| GET    | `/api/health`  | Health check  |
| GET    | `/api/threads` | List threads  |
| POST   | `/api/threads` | Create thread |
| GET    | `/api/notes`   | List notes    |
| POST   | `/api/notes`   | Create note   |

---

## Development

### Commands

```bash
pnpm dev              # Start all services (web + server)
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm typecheck        # Type-check all packages
pnpm lint             # Lint all packages
pnpm format           # Format with Prettier
pnpm clean            # Clean all dist folders
```

### Single Package

```bash
pnpm --filter @signhify/server build
pnpm --filter @signhify/agents test
pnpm --filter @signhify/web typecheck
```

### Quality Gate

```bash
pnpm typecheck && pnpm lint && pnpm build && pnpm test
```

---

## Tech Stack

| Layer         | Technology                                              |
| ------------- | ------------------------------------------------------- |
| Frontend      | React 19, Vite, Tailwind CSS v4, Zustand, Framer Motion |
| Backend       | Express, Mongoose, node-cron                            |
| LLM Framework | LangChain.js (OpenAI, Anthropic, Groq, Gemini)          |
| Database      | MongoDB 7                                               |
| Cache         | Redis 7 (optional)                                      |
| Build         | Turborepo, pnpm, TypeScript                             |
| Deployment    | Docker, Docker Compose                                  |

---

## Troubleshooting

### "Port already in use"

```bash
# Kill the process on port 4000 (server)
lsof -ti:4000 | xargs kill -9

# Or use a different port in server/.env
PORT=4001
```

### "MongoDB connection refused"

```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name signhify-mongo mongo:7

# Or check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"
```

### "Cannot find module @signhify/\*"

```bash
# Reinstall dependencies from root
pnpm install
```

### "Vite proxy error"

The Vite dev server proxies API requests to the backend. Make sure:

- Server is running on port 4000 (or update `vite.config.ts`)
- `CORS_ORIGIN` in `server/.env` matches `http://localhost:5173`

### Frontend shows "System Initialization Required"

You need at least one LLM API key. Go to **Settings → API Keys** and add a key from a free provider like Groq or Gemini.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Signhify AI</strong> · Built with care by the open source community
</p>
