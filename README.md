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

## Quick Install by Platform

Choose your operating system for copy-paste commands:

| Platform    | Guide                                    | Time   |
| ----------- | ---------------------------------------- | ------ |
| **Windows** | [INSTALL_WINDOWS.md](INSTALL_WINDOWS.md) | ~5 min |
| **macOS**   | [INSTALL_MAC.md](INSTALL_MAC.md)         | ~5 min |
| **Linux**   | [INSTALL_LINUX.md](INSTALL_LINUX.md)     | ~5 min |

### Windows (PowerShell)

```powershell
# Install prerequisites
corepack enable
corepack prepare pnpm@10.10.0 --activate

# Clone and install
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai
pnpm install

# Set up environment
Copy-Item server\.env.example server\.env
notepad server\.env   # Set JWT_SECRET and MONGODB_URI

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name signhify-mongo mongo:7

# Start dev server
pnpm dev
```

Open **http://localhost:5173**

### macOS (Terminal)

```bash
# Install prerequisites
brew install node@22
corepack enable
corepack prepare pnpm@10.10.0 --activate

# Clone and install
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai
pnpm install

# Set up environment
cp server/.env.example server/.env
nano server/.env   # Set JWT_SECRET and MONGODB_URI

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name signhify-mongo mongo:7

# Start dev server
pnpm dev
```

Open **http://localhost:5173**

### Linux (bash)

```bash
# Install prerequisites
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
corepack enable
corepack prepare pnpm@10.10.0 --activate

# Clone and install
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai
pnpm install

# Set up environment
cp server/.env.example server/.env
nano server/.env   # Set JWT_SECRET and MONGODB_URI

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name signhify-mongo mongo:7

# Start dev server
pnpm dev
```

Open **http://localhost:5173**

### Any Platform — Docker One-Liner

```bash
git clone https://github.com/Warriorlegacy/signhify-ai.git && cd signhify-ai && cp server/.env.example server/.env && docker compose up -d --build
```

Open **http://localhost**

---

## Getting API Keys (BYOK)

You need at least one LLM provider key. Free options:

| Provider      | Get Key At                                                           | Free Tier     |
| ------------- | -------------------------------------------------------------------- | ------------- |
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey)     | Yes           |
| Groq          | [console.groq.com/keys](https://console.groq.com/keys)               | Yes           |
| OpenRouter    | [openrouter.ai/keys](https://openrouter.ai/keys)                     | Yes           |
| OpenAI        | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Pay per token |
| Anthropic     | [console.anthropic.com](https://console.anthropic.com/settings/keys) | Pay per token |

Add keys in the web UI at **Settings → API Keys**, or set them in `server/.env` for scheduled tasks.

---

## CLI Reference

The `signhify` CLI gives you full control from the terminal.

### Install the CLI

```bash
cd packages/cli
pnpm build
pnpm link --global

signhify --version
```

### All Commands

```
signhify config              Set server URL
signhify login               Login with email/password
signhify status              Show server health

signhify ask <message>       Chat with agents (streams response)
  -t, --thread <id>         Continue a specific thread

signhify tui                 Launch interactive terminal REPL

signhify threads list        List recent threads
signhify threads create <t>  Create a new thread

signhify memory list         List memory vault notes
signhify memory add <k> <v>  Add a note to vault
  -t, --tags <tags>          Comma-separated tags
signhify memory delete <id>  Delete a memory note

signhify recall search <q>   Semantic memory search
  -k, --top <n>              Number of results (default: 5)
signhify recall context <q>  Get relevant context for a query
signhify recall stats        Show memory statistics
signhify recall fact list    List all facts
signhify recall fact get <k> Get a specific fact
signhify recall fact delete <k> Delete a fact

signhify skills list         List all skills
signhify skills approve <id> Approve a skill
signhify skills reject <id>  Reject a skill

signhify schedule list       List scheduled tasks
signhify schedule add <n> <cron> <prompt>  Schedule a task
signhify schedule delete <id> Delete a task
signhify schedule toggle <id> Enable/disable a task
signhify schedule status     Show scheduler status

signhify profile             View your user profile
```

### CLI Examples

```bash
# First-time setup
signhify config              # Set server URL (e.g., https://signhify-ai.onrender.com)
signhify login               # Enter email + password

# Chat
signhify ask "Research quantum computing breakthroughs"
signhify ask "Write a blog post about React 19" --thread abc123

# Memory
signhify memory add "project_deadline" "March 15, 2026" -t "project,deadline"
signhify recall search "project deadline"
signhify recall context "what are my upcoming deadlines"

# Skills
signhify skills list
signhify skills approve 64f1a2b3c4d5e6f7a8b9c0d1

# Scheduling
signhify schedule add "morning_briefing" "0 9 * * *" "Research top AI news and summarize"
signhify schedule list
signhify schedule toggle 64f1a2b3c4d5e6f7a8b9c0d1

# Profile
signhify profile

# Interactive mode
signhify tui
  you › What's on my schedule today?
  ai  › [streams response]
  you › /memory
  you › /profile
  you › /quit
```

### TUI Commands

| Command    | Description               |
| ---------- | ------------------------- |
| `/quit`    | Exit the TUI              |
| `/memory`  | Search your memory vault  |
| `/profile` | View your user profile    |
| `/status`  | Check server health       |
| `/history` | Show conversation history |
| `/clear`   | Clear the screen          |
| `/help`    | Show all commands         |

---

## Agents

| Agent      | What It Does                               |
| ---------- | ------------------------------------------ |
| **Nexus**  | Routes your intent to the right specialist |
| **Scribe** | Writes content, summaries, and edits       |
| **Scout**  | Researches the web with live citations     |
| **Forge**  | Generates and debugs code                  |
| **Vault**  | Manages your personal knowledge base       |
| **Herald** | Handles communication and scheduling       |
| **Vision** | Analyzes images and screenshots            |

---

## Keyboard Shortcuts (Web UI)

| Shortcut                | Action               |
| ----------------------- | -------------------- |
| `Cmd+K` / `Ctrl+K`      | Open command palette |
| `Cmd+1` through `Cmd+5` | Switch between views |
| `Enter`                 | Send message         |
| `Esc`                   | Close modals         |

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
├── INSTALL_WINDOWS.md          # Windows installation guide
├── INSTALL_MAC.md              # macOS installation guide
└── INSTALL_LINUX.md            # Linux installation guide
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

---

## Troubleshooting

| Problem                          | Solution                                                 |
| -------------------------------- | -------------------------------------------------------- |
| `pnpm: command not found`        | Run `corepack enable` and restart terminal               |
| `MongoNetworkError`              | Ensure MongoDB is running: `docker ps`                   |
| `EADDRINUSE`                     | Port taken — change `PORT` in `.env` or kill the process |
| `Cannot find module @signhify/*` | Run `pnpm install` from project root                     |
| "System Initialization Required" | Add at least one API key in Settings → API Keys          |
| Vite proxy error                 | Ensure server is on port 4000 and `CORS_ORIGIN` matches  |
| Docker build fails               | Ensure Docker Desktop is running                         |

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
