# Architecting a Self-Improving Personal AI Assistant

## Current State Assessment

Signhify AI already has the substrate for this vision:

- **Express + MongoDB backend** (`server/`) with auth, threads, notes
- **LangChain.js agent layer** (`packages/agents/`) with Nexus, Scribe, Scout, Forge, Vault, Herald, Vision
- **Memory package** (`packages/memory/`) – currently basic in-memory store with embedding utilities
- **React frontend** (`apps/web/`) with Vite, Zustand, React Three Fiber
- **Shared types** (`packages/types/`)
- **Turborepo monorepo** with workspace protocol for internal deps

What's missing for a truly self-improving, model-agnostic assistant:
- No persistent cross-session memory or user profiling
- No skill-generation / tool-use framework
- LLM providers hardcoded via LangChain integrations; no runtime provider swapping
- No scheduling subsystem
- No external gateway adapters (Telegram, Discord, CLI-only)
- No cloud-optimized deployment pipeline

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ACCESS LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Web UI     │  │  Telegram    │  │  CLI (Rich/Typer)    │  │
│  │  (React)     │  │  Gateway     │  │  + TUI (Textual)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┼──────────────────────┘              │
│                           │                                     │
│                    ┌──────▼─────────────────────────────┐       │
│                    │         API Gateway                 │       │
│                    │   (Express / Fastify / Hono)        │       │
│                    └──────┬─────────────────────────────┘       │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   ORCHESTRATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Agent Runtime                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │  Scheduler  │  │  Skill      │  │  Memory         │  │   │
│  │  │  (node-cron)│  │  Registry   │  │  Manager        │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   PROVIDER ABSTRACTION LAYER                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   OpenAI    │  │ Anthropic   │  │ OpenRouter  │  ... more   │
│  │   Adapter   │  │  Adapter    │  │  Adapter    │  via litellm │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    PERSISTENCE LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │  MongoDB    │  │  Redis      │  │  Vector Store       │      │
│  │  (Users,    │  │  (Cache,    │  │  (Memories, Skills, │      │
│  │   Threads,  │  │   Sessions, │  │   User Profile)     │      │
│  │   Skills)   │  │   Queue)    │  │   (pgvector /        │      │
│  │             │  │             │  │    MongoDB Atlas)   │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Recommended Technology Stack

### Backend
| Component | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 22+ | Already in use; good async I/O for I/O-bound agent workloads |
| Framework | Express (incrementally migrate toward Fastify for perf) | Existing; minimal disruption |
| LLM Orchestration | LangChain.js + **LiteLLM** | LiteLLM provides unified API for OpenAI, Anthropic, OpenRouter, local models. Avoids rewriting agent logic per provider. |
| Scheduler | `node-schedule` or `bullmq` + Redis | BullMQ gives durable delayed jobs, retries, and a dashboard. Critical for "always-on" reliability. |
| Memory / Vector | **MongoDB Atlas Vector Search** (upgrade existing MongoDB) | Already using MongoDB; Atlas Vector Search adds semantic retrieval without adding a new infra dependency. Alternative: Qdrant or pgvector if separating. |
| Cache / Sessions / Queue | Redis | Session store, rate-limit cache, BullMQ backing. One service solves three needs. |
| Telegram Gateway | `grammy` or `node-telegram-bot-api` | Modern, well-maintained, supports webhook + polling. |
| Discord Gateway | `discord.js` | Standard, battle-tested. |
| Auth | Existing JWT + bcrypt | Extend with refresh tokens for long-lived gateway sessions. |
| Observability | OpenTelemetry + structured logging (Pino) | Critical for diagnosing autonomous agent loops in production. |

### CLI / TUI
| Component | Choice | Rationale |
|---|---|---|
| CLI framework | **Typer** | Python-inspired ergonomics, auto-completion, subcommands. |
| TUI framework | **Textual** | Same author as Typer; rich, animated terminal UIs for monitoring agent activity. |
| Config management | `conf` / `rc` | Store user preferences, provider keys, agent profiles locally. |

### Frontend
| Component | Choice | Rationale |
|---|---|---|
| Already in place | React + Vite + Tailwind v4 + Zustand + React Three Fiber | Keep. Extend with agent thought-stream visualization and skill marketplace UI. |
| Real-time updates | Server-Sent Events or WebSocket | Streaming agent responses; avoid polling. |

### Infrastructure
| Component | Choice | Rationale |
|---|---|---|
| Hosting | **Fly.io** or **Hetzner VPS + Docker Compose** | Both offer <$10/month ARM/x86 instances. Fly.io gives global edge + managed Redis/Mongo. Hetzner gives raw value. |
| Container | Docker Compose (local) + Dockerfile (production) | Already in use. Extend to multi-service compose: app, mongo, redis. |
| Secrets | `.env` (Fly secrets / Docker secrets in production) | Never commit. Use provider-managed secret stores. |
| CI/CD | GitHub Actions | Already configured. Add build-and-push image on tag. |

---

## High-Level System Design

### 1. Persistent Memory & User Profiling

**Goal:** The assistant remembers who you are, what you care about, and how you like things done.

#### Memory Taxonomy

| Memory Type | Scope | Storage | TTL |
|---|---|---|---|
| **Episodic** | Specific conversation events / actions | MongoDB `episodes` | Permanent; reviewed periodically |
| **Semantic** | Facts about the user (preferences, context, decisions) | MongoDB `facts` + Vector Search | Permanent |
| **Procedural** | Reusable skills / workflows | MongoDB `skills` + git repo | Permanent |
| **Working** | Current session context | Redis | Session lifetime |

#### User Profile Model

```typescript
userProfile.md // Generated knowledge graph-ish summary
{
  identity: { name, timezone, language, preferredModel },
  preferences: { communicationStyle, detailLevel, avoidTopics[] },
  context: { currentProjects[], recurringTasks[], importantPeople[] },
  goals: [ { id, description, status, created } ],
  interactions: [ { timestamp, summary, sentiment } ]
}
```

**Update triggers:**
- End of every conversation: extract 3–5 salient facts → upsert to semantic memory
- Weekly: regenerate `userProfile.md` from recent episodic + semantic memories
- Explicit: user says "remember that..." → high-priority semantic insert

#### Retrieval Strategy

1. On each user message, retrieve top-k semantically similar memories (vector search).
2. Inject as system context: `[Memory: You know that the user prefers terse answers...]`
3. After response, store the exchange as an episode.

### 2. Model-Agnostic LLM Layer

**Goal:** Swap models (or even local models) by changing one config field.

#### Adapter Contract

All providers implement:

```typescript
interface LLMAdapter {
  name: string;
  complete(messages: Message[], options?: Options): Promise<string>;
  stream?(messages: Message[], options?: Options): AsyncIterator<string>;
  listModels?(): Promise<string[]>;
}
```

#### Provider Routing

```
User config: provider = "openrouter", model = "anthropic/claude-3.5-sonnet"
         │
         ▼
   LiteLLM gateway (optional)
         │
    ┌────┴────┐
    │         │
  Direct   Proxy
  API call  (OpenRouter handles routing to Anthropic/OpenAI/etc.)
```

**Recommendation:** Use **LiteLLM** as a local proxy. It normalizes OpenAI-compatible APIs to Anthropic's Messages format and vice-versa. It also supports local models (Ollama, llama.cpp) out of the box.

**Config example:**

```yaml
providers:
  openai:
    apiKey: ${OPENAI_API_KEY}
    models: [gpt-4o, gpt-4o-mini]
  anthropic:
    apiKey: ${ANTHROPIC_API_KEY}
    models: [claude-3-5-sonnet-20240620]
  openrouter:
    apiKey: ${OPENROUTER_API_KEY}
    models: [anthropic/claude-3.5-sonnet, google/gemini-pro]

defaults:
  provider: openrouter
  model: anthropic/claude-3.5-sonnet
```

**Hot-swap flow:**
1. User: `/model openrouter gemini-1.5-pro`
2. Runtime updates active provider/model in Redis session
3. Subsequent calls route to new provider
4. No restart required.

### 3. Autonomous Skill Generation

**Goal:** After completing a complex task, the agent packages the successful execution into a reusable "skill" that can be invoked later.

#### Skill Schema

```yaml
skill:
  id: "git-pr-review"
  name: "Git PR Review"
  description: "Reviews a PR diff, summarizes changes, and flags issues"
  trigger: "Review my PR #123"
  version: "1.0.0"
  created: "2026-06-17"
  lastUsed: "2026-06-17"
  successCount: 3
  failureCount: 0
  steps:
    - tool: bash
      args: ["gh", "pr", "diff", "$PR_NUMBER"]
    - tool: llm
      prompt: "Review this diff: $OUTPUT"
    - tool: message
      destination: user
```

#### Generation Pipeline

```
Successful Complex Task
         │
         ▼
   [Reflection Phase]
   1. Agent replays task transcript
   2. Identifies reusable steps
   3. Names the skill / derives trigger phrases
         │
         ▼
   [Validation Phase]
   1. Dry-run skill on similar input
   2. If success → register
   3. If failure → flag for human review
         │
         ▼
   [Skill Registry]
   Stored in MongoDB + versioned in git
   Available via: /skill run <name>
```

**Skill storage:** MongoDB for metadata, git for the actual code/prompt assets. This gives versioning and auditability.

**Skill invocation:** The agent's tool-use layer adds a `skill` tool. When a user request matches a skill's trigger, the agent can either auto-execute or suggest execution.

**Safety:** Skills are sandboxed. Each skill runs in a restricted bash environment (Docker container or Firecracker microVM for untrusted code). Network access is gated via an allowlist.

### 4. Multi-Platform Access

#### Telegram Gateway

- Bot token stored in env.
- Webhook on `/gateway/telegram/webhook` or long-polling.
- Maps `chatId` → `userId` in MongoDB.
- Supports inline keyboards for quick actions.
- Handles media: voice → Whisper STT → text; image → VLM.

#### Discord Gateway

- Gateway intents: `GUILDS`, `GUILD_MESSAGES`, `DIRECT_MESSAGES`.
- Per-channel routing: agent can be added to servers; respects per-channel config.
- Slash commands for `/ask`, `/skill`, `/schedule`.

#### CLI + TUI

- **CLI:** `signhify ask "What's on my calendar?"` → one-shot, prints result.
- **TUI:** `signhify` → launches Textual app with:
  - Chat pane
  - Agent thought stream
  - Memory browser
  - Skill list
  - Scheduler dashboard

All three access paths share the same API gateway and identity model.

### 5. Scheduling

**Goal:** "Send me a daily report at 9 AM."

#### Design

```typescript
interface Schedule {
  id: string;
  userId: string;
  cron: string;
  prompt: string;
  destination: "cli" | "telegram" | "discord" | "email" | "webhook";
  lastRun?: Date;
  nextRun: Date;
  active: boolean;
}
```

#### Implementation

- **BullMQ** + Redis handles scheduling with cron support.
- Each scheduled job:
  1. Constructs a synthetic user message from the prompt template.
  2. Runs it through the agent (with memory context + user profile).
  3. Routes the result to the configured destination.
- Retry policy: 3 attempts with exponential backoff.
- Observability: log every job execution (success/failure/latency).

#### Examples

```bash
# Natural language → cron
"Send me a daily summary at 9am"  →  0 9 * * *

# Complex
"Every Monday at 8, review my github issues and send to Telegram"
→  0 8 * * 1   +   tool: gh issue list   +   destination: telegram:me
```

---

## Phased Development Plan

### Phase 1: Foundation (Weeks 1–2)
**Goal:** Harden the existing backend for multi-provider support and durable state.

- [x] Audit existing `server/` and `packages/`.
- [ ] Replace per-provider LangChain imports with **LiteLLM adapter**.
- [ ] Add Redis to `docker-compose.yml` for sessions + future BullMQ.
- [ ] Implement `LLMAdapter` interface + concrete LiteLLM adapter.
- [ ] Add `.env` validation at startup (keep current behavior, extend for provider keys).
- [ ] Add structured logging (Pino) across all packages.

**Deliverable:** Server runs, accepts `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENROUTER_API_KEY`, routes to chosen provider.

### Phase 2: Memory Layer (Weeks 3–4)
**Goal:** Persistent, searchable memory with user profiling.

- [ ] Design MongoDB schemas: `episodes`, `facts`, `userProfiles`.
- [ ] Implement vector embedding pipeline (OpenAI `text-embedding-3-small` or local `nomic-embed-text` via Ollama).
- [ ] Build Memory Manager service: store / recall / forget / summarize.
- [ ] Implement weekly profile regeneration job.
- [ ] Integrate memory retrieval into the agent's request pipeline.
- [ ] Add `/memory` CLI command and API endpoint to browse memories.

**Deliverable:** Agent recalls prior conversations; builds a basic user profile.

### Phase 3: Skill Generation Framework (Weeks 5–7)
**Goal:** Agent can create and invoke its own skills.

- [ ] Define skill schema + MongoDB collection.
- [ ] Build Skill Registry service: register / list / invoke / version / deprecate.
- [ ] Implement reflection prompt (agent analyzes its own successful task execution).
- [ ] Add skill dry-run + validation step before registration.
- [ ] Create `/skill` API routes + CLI commands.
- [ ] Add a simple approval workflow (required for dangerous skills).

**Deliverable:** Agent can create a skill after a complex task; user can view/run it.

### Phase 4: Gateways & CLI Enhancement (Weeks 8–9)
**Goal:** Access from everywhere.

- [ ] Build Telegram adapter (`grammy`).
- [ ] Build Discord adapter (`discord.js`).
- [ ] Implement chatId → userId mapping.
- [ ] Build multi-modal handling (voice → STT; image → VLM).
- [ ] Enhance CLI: Typer one-shot commands.
- [ ] Build Textual TUI with chat, memory browser, skill list.

**Deliverable:** Chat with the same agent from Telegram, Discord, or `signhify` TUI.

### Phase 5: Scheduling (Weeks 10–11)
**Goal:** Automated, time-based tasks.

- [ ] Add BullMQ + Redis worker to server.
- [ ] Implement Scheduler service: create / list / cancel / test.
- [ ] Build prompt template engine (cron + variables).
- [ ] Add `/schedule` API + CLI + TUI dashboard.
- [ ] Handle recurring failures: alert after 3 consecutive failures.

**Deliverable:** "Send me a daily report at 9am" actually works.

### Phase 6: Production Hardening & Cloud Deployment (Weeks 12–14)
**Goal:** Always-on, cheap, reliable.

- [ ] Docker Compose: app + mongodb + redis.
- [ ] Configure Fly.io or Hetzner deployment.
- [ ] Add health checks + readiness probes.
- [ ] Set up OpenTelemetry + structured logs.
- [ ] Rate limiting + abuse detection on gateways.
- [ ] Backup strategy for MongoDB (Atlas automated backups or pg_dump-like for MongoDB).
- [ ] Cost estimation: <$10/month on Hetzner (CX11 + managed Redis) or Fly.io (shared-cpu-1x + Redis).

**Deliverable:** Staging deployment, monitoring, cost-optimized.

---

## Repo-Specific Implementation Annotations

Where new code lands in the existing monorepo:

```
signhify_ai/
├── packages/
│   ├── types/          ← Add: Memory, Skill, Schedule, Provider interfaces
│   ├── memory/         ← Extend: vector search, episodic/semantic stores
│   ├── agents/         ← Restructure: slim orchestrator, use adapters
│   └── skills/         ← NEW: skill registry, validation, invocation
├── server/
│   ├── src/
│   │   ├── adapters/   ← NEW: LLMAdapters (OpenAI, Anthropic, LiteLLM)
│   │   ├── gateways/   ← NEW: TelegramAdapter, DiscordAdapter
│   │   ├── services/   ← Extend: MemoryService, SkillService, SchedulerService
│   │   ├── routes/     ← Add: /api/memory, /api/skills, /api/schedule
│   │   └── index.ts    ← Wire new services
│   └── .env.example    ← Add: REDIS_URI, OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.
├── apps/
│   ├── web/            ← Extend: memory browser, skill marketplace, scheduler UI
│   └── (new) cli/      ← NEW: Typer CLI + Textual TUI
└── infra/
    └── docker-compose.yml   ← Add: redis service
```

---

## Key Design Decisions & Rationale

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| **LiteLLM over per-provider SDKs** | Direct OpenAI / Anthropic SDKs | Single interface; hot-swap providers without rewriting agents; supports local models. |
| **MongoDB Atlas Vector over new DB** | Qdrant, pgvector, Pinecone | Reuses existing infra; one less network hop; cost-effective. |
| **BullMQ over node-cron** | node-schedule, agenda | BullMQ provides retries, persistence, and a built-in dashboard. Critical for "always-on" schedules. |
| **Telegram + Discord grammy + discord.js** | Botpress, Voiceflow | Lightweight, self-hosted, full control over prompts and memory context. |
| **Textual TUI** | Blessed, Ink | Python ecosystem, if sticking to Node: consider `ink` or a web-based local server. If Node-only: `blessed` or Electron fallback. For the fastest path, build the TUI as a separate Electron or Neutralino app. |
| **Hetzner / Fly.io over AWS/GCP** | AWS Lambda, GCP Cloud Run | <$10/month target. Managed cloud is overkill and expensive for always-on agent. |
| **Skills versioned in git** | DB-only | Git gives immutable history, rollback, and diff. Skills are code-like artifacts. |

---

## Non-Negotiables

1. **No secret in git.** `.env` files stay local; use Fly secrets / Docker secrets in production.
2. **Skills are sandboxed.** Untrusted code from skill generation must not escape its container.
3. **Memory is opt-out, not opt-in.** User can delete individual memories or disable profiling, but defaults capture context.
4. **Provider fallback.** If primary model fails, fall back to secondary before surfacing an error to the user.
5. **Scheduler idempotency.** Scheduled tasks may run twice on restart; design prompts to handle duplicate execution gracefully.
