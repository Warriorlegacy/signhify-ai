# 📋 SIGNHIFY AI: Complete Product & Engineering Plan

**Inspired by IRIS Ecosystem | Legally Distinct | India-First | Production-Ready**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Requirements Document (PRD)](#1-product-requirements-document-prd)
3. [Technical Requirements Document (TRD)](#2-technical-requirements-document-trd)
4. [Phased Development Plan](#3-phased-development-plan)
5. [Repository & DevOps Structure](#4-repository--devops-structure)
6. [Ethical Reverse Engineering Guide](#5-ethical-reverse-engineering-guide)
7. [Deliverables Checklist by Phase](#6-deliverables-checklist-by-phase)
8. [Risk, Compliance & Licensing](#7-risk-compliance--licensing)
9. [Free Tech Stack Recommendation](#8-free-tech-stack-recommendation)
10. [MVP Outline & Bootstrap](#9-mvp-outline--bootstrap)
11. [Example Code Scaffolds](#10-example-code-scaffolds--starter-data-models)

---

## Executive Summary

**Signhify AI** is an autonomous AI execution layer designed for **Indian developers, entrepreneurs, and technical teams** who need to automate workflows, manage projects, and execute real system tasks via natural language — without vendor lock-in or expensive cloud infrastructure.

### Key Positioning

> _"Signhify AI: Your Private, Autonomous AI Co-Engineer. Chat in Hindi or English. Your system executes. Zero APIs, unless you add them. Build faster. Automate everything."_

### Why Signhify AI (Not IRIS)?

| Aspect           | IRIS                          | Signhify AI (Differentiation)    |
| ---------------- | ----------------------------- | -------------------------------- |
| **Target**       | Global developers (US-focus)  | Indian SMBs, startups, freelance |
| **Language**     | English-only                  | English + Hindi voice/text       |
| **Backend**      | Windows/Mac/Linux desktop     | Web-first (CLI secondary)        |
| **Licensing**    | Closed core + sponsor tiers   | Open core + community-driven     |
| **Positioning**  | "Neural OS"                   | "Your AI Co-Engineer"            |
| **Pricing**      | Free + $5-$50/month sponsors  | Free forever + optional tips     |
| **Primary UX**   | Desktop Electron app          | Web dashboard + WhatsApp CLI     |

---

# 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1.1 Product Vision

Signhify AI is an autonomous AI execution layer designed for **Indian developers, entrepreneurs, and technical teams** who need to automate workflows, manage projects, and execute real system tasks via natural language — without vendor lock-in or expensive cloud infrastructure.

### Positioning Statement

> _"Signhify AI: Your Private, Autonomous AI Co-Engineer. Chat in Hindi or English. Your system executes. Zero APIs, unless you add them. Build faster. Automate everything."_

---

## 1.2 Objectives & Success Metrics

### Primary Objectives (Q1–Q2 2026)

1. **MVP Shipped** – Fully functional open-source core by end Q1
   - Success: 500+ GitHub stars, 50+ forks within 2 months

2. **Community Validation** – Real users on free tier
   - Success: 100+ active users on free plan by Q2

3. **Monetization Path** – Sponsorship + optional tier clarity
   - Success: 5+ sponsors at any tier by Q2

4. **Technical Debt Addressed** – Production-ready codebase
   - Success: <2% test failure rate, full documentation coverage

### Secondary Objectives (Q3–Q4 2026)

5. **WhatsApp Native** – Seamless WhatsApp CLI integration
   - Success: 80%+ command execution via WhatsApp

6. **Multi-Agent System** – Full agent orchestration (Master + 6 specialized agents)
   - Success: 95%+ task success rate on standard workflows

7. **Regional Expansion** – Localization for Hindi, Tamil, Telugu markets
   - Success: 30%+ non-English commands processed

### Success Metrics

| Metric                  | Target (Q2 2026) | Measurement                   |
| ----------------------- | ---------------- | ----------------------------- |
| GitHub Stars            | 500+             | stars/month growth rate       |
| Active Users (Free)     | 100+             | unique monthly active users   |
| Sponsors                | 5+               | any tier                      |
| Task Success Rate       | 90%+             | successful automations / total |
| Avg Response Time       | <2s              | command → execution           |
| Code Coverage           | >80%             | unit + integration tests      |
| Documentation %         | 100%             | all public APIs documented    |
| Community Issues (Open) | <20%             | % resolved within 7 days      |

---

## 1.3 Target Personas

### Persona 1: Freelance AI Engineer

- **Name:** Rahul (29, Delhi)
- **Background:** Full-stack dev, 5+ years, building micro-SaaS
- **Pain Point:** Switching between 10+ tools (Gmail, Notion, terminal, IDE, browser) to complete one task
- **Goal:** Automate workflow, reduce friction, build faster
- **Signhify AI Usage:**
  - "Create a Next.js project, install dependencies, and push to GitHub" → AI executes 5 steps in sequence
  - "Search my codebase for TODO comments across 3 projects" → AI returns structured results
  - Voice commands while hands are busy coding

### Persona 2: Indian EdTech Founder

- **Name:** Priya (31, Bangalore)
- **Background:** Runs online tutoring platform, non-technical co-founder
- **Pain Point:** Manual student data tracking, scheduling, report generation
- **Goal:** Automate admin tasks, focus on curriculum
- **Signhify AI Usage:**
  - "Generate weekly progress reports for my 20 students" → PDF batch generated
  - WhatsApp commands: "List today's classes" → AI reads calendar, responds
  - "Create assignment PDFs from question bank" → Bulk file generation

### Persona 3: Open-Source Community Member

- **Name:** Aditya (23, Pune, college student)
- **Background:** Hobby developer, curious about AI systems
- **Pain Point:** Can't afford $50/month for enterprise tools
- **Goal:** Learn, contribute, build cool stuff
- **Signhify AI Usage:**
  - Fork on GitHub, run locally, contribute bug fixes
  - Extend with custom tools/integrations
  - Join sponsorship tier at $0 (no cost option)

---

## 1.4 Core Features (MVP → Full)

### Phase 1: MVP (8 weeks)

**User Input Layer:**
- ✅ Web-based text command input (React dashboard)
- ✅ User authentication (Google OAuth)
- ✅ Command history & persistence

**Execution Layer:**
- ✅ Master Agent (Gemini API, reasoning)
- ✅ File Agent (read, write, list directories)
- ✅ Terminal Agent (run basic shell commands)
- ✅ Search Agent (local file semantic search)

**Output & Delivery:**
- ✅ Streaming response UI
- ✅ JSON-structured tool results
- ✅ Download/copy results

### Phase 2: Enhancement (Weeks 9–16)

**Voice Input:**
- ✅ Voice command via Web Audio API + Whisper
- ✅ Multi-language (English + Hindi)
- ✅ Wake-word detection (local)

**Advanced Agents:**
- ✅ Coder Agent (generate code, explain errors)
- ✅ Browser Agent (read public websites, fill forms)
- ✅ Research Agent (Google Search API integration)

**Mobile/WhatsApp:**
- ✅ WhatsApp Business API integration
- ✅ Command routing via WhatsApp messages
- ✅ Text-only responses

### Phase 3: Advanced (Weeks 17–24)

**System Control & Automation:**
- ✅ Desktop window management
- ✅ Keyboard/mouse automation
- ✅ Image generation (Hugging Face API)

**Memory & Personalization:**
- ✅ User memory graph (past commands, preferences)
- ✅ Custom macros (named multi-step workflows)
- ✅ Team accounts (shared workspaces)

**Ecosystem:**
- ✅ Plugin marketplace (community tools)
- ✅ Zapier/Make integration
- ✅ Telegram bot interface

---

## 1.5 Non-Functional Requirements

| Requirement        | Target                      | Rationale                      |
| ------------------ | --------------------------- | ------------------------------ |
| **Availability**   | 99.5% uptime                | Production SaaS standard       |
| **Latency**        | <2s command → response      | User expectation for "instant" |
| **Throughput**     | 1000 req/min per server     | Burst traffic handling         |
| **Security**       | AES-256 encryption (rest)   | Data at rest protection        |
| **Compliance**     | GDPR + India DPA (optional) | Regional + global readiness    |
| **Scalability**    | Horizontal (Docker scale)   | Load balancing via reverse LB  |
| **Recovery**       | RTO: 1 hour, RPO: 15 min    | Disaster recovery              |
| **Localization**   | English + Hindi UI          | Market fit for India           |
| **API Rate Limits** | 100 req/min (free tier)    | Cost control on external APIs  |

---

## 1.6 Phased Timeline & Milestones

```
Q1 2026 (Jan–Mar)
├─ Week 1-2:    Spec finalization + architecture design
├─ Week 3-4:    Backend scaffold + auth setup
├─ Week 5-8:    MVP core (Master Agent + 3 agents)
├─ MILESTONE:   Alpha launch (internal testing)
│
Q2 2026 (Apr–Jun)
├─ Week 9-10:   Voice input + Hindi support
├─ Week 11-12:  Coder + Browser agents
├─ Week 13-14:  WhatsApp CLI integration
├─ Week 15-16:  Beta launch (public GitHub + Vercel)
├─ MILESTONE:   v1.0 stable release
│
Q3 2026 (Jul–Sep)
├─ Week 17-18:  System control + automation tools
├─ Week 19-20:  Memory graph + custom macros
├─ Week 21-22:  Plugin marketplace scaffold
├─ MILESTONE:   v1.5 launch with community features
│
Q4 2026 (Oct–Dec)
├─ Week 23-24:  Zapier/Make integrations
├─ Week 25-26:  Telegram bot interface
├─ MILESTONE:   v2.0 ecosystem launch
```

---

## 1.7 Pricing & Monetization Strategy

### Tier 1: Free (Forever)

- **Inclusions:**
  - 100 commands/month
  - 3 concurrent agents
  - Web UI only (no voice)
  - Community support (GitHub discussions)
  - Public source code access
- **Cost to Signhify:** API credits ~$0.50/user/month (Gemini free tier covers)
- **Target:** Hobbyists, students, evaluation users

### Tier 2: Supporter ($5/month, Optional)

- **Inclusions:**
  - Unlimited commands
  - All agents (including voice)
  - Community & email support
  - Sponsor badge on GitHub
  - Early access to beta features
- **Cost:** API credits ~$2/user/month + 20% margin
- **Target:** Freelancers, small teams

### Tier 3: Pro ($15/month, Optional)

- **Inclusions:**
  - Everything in Supporter
  - Priority API access (higher rate limits)
  - 1GB private file storage
  - Advanced memory graph
  - Team accounts (up to 3 users)
  - Private plugin marketplace access
- **Cost:** ~$4/user/month
- **Target:** Agencies, growing startups

### Tier 4: Enterprise (Custom, Future)

- **Inclusions:**
  - Self-hosted deployment option
  - Custom agent development
  - SLA + dedicated support
  - Unlimited seats
  - Private Slack channel
- **Model:** $500–$5000/month (negotiated)
- **Target:** Large organizations, ISVs

---

# 2. TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 2.1 Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Dashboard (Next.js 15)                         │   │
│  │  ├─ Command Input & History                          │   │
│  │  ├─ Voice Input (Web Audio API + Whisper API)        │   │
│  │  ├─ Streaming Response UI                            │   │
│  │  └─ Settings (API key mgmt, preferences)             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                    GATEWAY LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js API Server (TypeScript)                 │   │
│  │  ├─ Auth (OAuth 2.0 + JWT)                          │   │
│  │  ├─ Command ingestion & validation                  │   │
│  │  ├─ WebSocket handler (streaming responses)         │   │
│  │  ├─ Rate limiting & quota enforcement               │   │
│  │  └─ Logging & monitoring (Pino logger)              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ Message Queue (Bull + Redis)
┌────────────────────▼────────────────────────────────────────┐
│                   ORCHESTRATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LangGraph-Based Agent Orchestrator                  │   │
│  │  ├─ Master Agent (Intent parsing + routing)         │   │
│  │  ├─ Tool executor (async parallel execution)        │   │
│  │  ├─ State machine (stateful workflows)              │   │
│  │  ├─ Error recovery & self-correction               │   │
│  │  └─ Execution tracing & observability               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬───────────────┐
     │               │               │               │
┌────▼────┐  ┌──────▼────┐  ┌──────▼────┐  ┌──────▼────┐
│  File   │  │ Terminal  │  │  Search   │  │  Browser  │
│  Agent  │  │  Agent    │  │  Agent    │  │  Agent    │
│         │  │           │  │           │  │           │
│ - Read  │  │ - Shell   │  │ - Vector  │  │ - Puppeteer
│ - Write │  │ - exec()  │  │   Query   │  │ - DOM Read
│ - Manage│  │ - Env var │  │ - LanceDB │  │ - Form Fill
└────┬────┘  └──────┬────┘  └──────┬────┘  └──────┬────┘
     │              │              │              │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼───┐  ┌───▼────┐  ┌──▼─────┐
   │ Coder  │  │Research│  │  Image │
   │ Agent  │  │ Agent  │  │ Gen    │
   │        │  │        │  │        │
   │- GPT  │  │-Tavily │  │-Hugging│
   │ Assist│  │-Google │  │ Face   │
   │        │  │        │  │        │
   └────────┘  └────────┘  └────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase (PostgreSQL + Real-time)                   │   │
│  │  ├─ User profiles & auth metadata                    │   │
│  │  ├─ Command history & logs                           │   │
│  │  ├─ Agent execution traces                           │   │
│  │  ├─ File index (for fast search)                     │   │
│  │  └─ Team & workspace management                      │   │
│  │                                                       │   │
│  │  Redis Cache (Bull jobs + session store)             │   │
│  │  ├─ Job queue for agent executions                   │   │
│  │  ├─ Session tokens                                   │   │
│  │  └─ Rate limit counters                              │   │
│  │                                                       │   │
│  │  LanceDB (Vector DB, local or cloud)                 │   │
│  │  ├─ File embeddings (for semantic search)            │   │
│  │  ├─ Command embeddings (for pattern matching)        │   │
│  │  └─ Memory graph (user preferences, past commands)   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL INTEGRATIONS                       │
│  ├─ Google Gemini API (primary LLM)                         │
│  ├─ Groq API (fallback inference)                           │
│  ├─ OpenAI Whisper (voice transcription)                    │
│  ├─ Google Cloud Storage (file uploads)                     │
│  ├─ Tavily Search (research queries)                        │
│  ├─ Hugging Face API (image generation)                     │
│  ├─ WhatsApp Business API (optional, Phase 2)               │
│  └─ Stripe (payment processing, optional)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2.2 Core Data Models

### User Model

```typescript
interface User {
  id: string (UUID)
  email: string
  google_id: string
  name: string
  avatar_url?: string
  tier: 'free' | 'supporter' | 'pro' | 'enterprise'
  api_key_hash: string (bcrypt)
  preferences: {
    language: 'en' | 'hi'
    timezone: string
    theme: 'light' | 'dark'
    voice_enabled: boolean
  }
  created_at: timestamp
  updated_at: timestamp
}
```

### Command Model

```typescript
interface Command {
  id: string (UUID)
  user_id: string
  content: string
  input_type: 'text' | 'voice'
  status: 'pending' | 'running' | 'completed' | 'failed'
  result: {
    success: boolean
    data?: any
    error?: string
    execution_time_ms: number
  }
  agents_used: string[] // ['master', 'file', 'terminal']
  trace: {
    steps: {
      agent: string
      tool: string
      input: any
      output: any
      duration_ms: number
    }[]
  }
  created_at: timestamp
  completed_at?: timestamp
}
```

---

## 2.3 Technology Stack (Free-Tier Optimized)

### Frontend

```yaml
Framework:
  - Next.js 15 (App Router, SSR/SSG)
  - React 19 (latest features)
  - TypeScript 5.x

Styling:
  - Tailwind CSS v4 (utility-first)
  - shadcn/ui (headless components)
  - Framer Motion (animations)

State:
  - TanStack Query (data fetching, caching)
  - Zustand (global state)

Voice/Audio:
  - Web Audio API (built-in, no deps)
  - OpenAI Whisper API (speech-to-text)
  - TTS: Web Speech API (free, built-in) or Google TTS API

Deployment:
  - Vercel (free tier: 100GB bandwidth, serverless functions, auto-scaling)
  - GitHub Pages (optional, static site backup)
```

### Backend

```yaml
Runtime:
  - Node.js 20.x (LTS)
  - TypeScript 5.x (strict mode)

Framework:
  - Express.js 4.x (lightweight, well-known)
  - Hono.js (optional, faster alternative)

Agent/LLM:
  - LangChain.js (chain definitions, tool management)
  - LangGraph.js (stateful graph execution)
  - Google Generative AI SDK (Gemini API)
  - Groq SDK (fallback inference)

Job Queue:
  - Bull (Redis-backed job queue)
  - Redis (free tier: Vercel KV or Railway)

Logging/Monitoring:
  - Pino (JSON structured logging, lightweight)
  - OpenTelemetry (optional, for tracing)

Security:
  - jsonwebtoken (JWT signing)
  - bcryptjs (password hashing)
  - helmet.js (HTTP header security)
  - express-rate-limit (rate limiting)

Testing:
  - Vitest (unit + integration tests)
  - Supertest (API testing)

Deployment:
  - Vercel (serverless, free tier: 10GB storage, 1000 executions/day)
  - Railway.app (free tier: $5/month credit, generous)
  - Render (free tier: auto-pause after 15 min inactivity)
```

### Database & Storage

```yaml
Primary Database:
  - Supabase (PostgreSQL + Real-time subscriptions)
  - Free tier: 500MB storage, 5GB bandwidth, unlimited API calls (rate-limited)
  - Features: row-level security, real-time subscriptions, vector similarity search (pgvector)

Vector Database:
  - LanceDB (local SQLite-backed or cloud)
  - Free tier: fully open-source, self-hosted

Cache / Session:
  - Vercel KV (Redis, free tier: 3k commands/day)
  - Railway Redis (free $5/month credit)
  - Redis Cloud (free tier: 30MB)

File Storage:
  - Supabase Storage (5GB free tier)
  - Alternatively: GCS free tier (1GB/month free egress)

Analytics:
  - PostHog (free, open-source, self-hosted option)
  - Vercel Analytics (built-in, free)
```

---

## 2.4 API Design (RESTful)

### Core Endpoints

```typescript
// Auth
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/callback/google
GET /api/auth/user

// Commands
POST /api/commands
  {
    "content": "Create a Next.js app in ~/projects",
    "input_type": "text"
  }
GET /api/commands (list with pagination)
GET /api/commands/:id (detailed trace)
DELETE /api/commands/:id

// File Management
GET /api/files/search
  { "query": "TODO", "limit": 10 }
POST /api/files/upload
GET /api/files/:id/content
DELETE /api/files/:id

// User Profile
GET /api/user/profile
PATCH /api/user/profile
GET /api/user/preferences
POST /api/user/api-key (generate new key)

// Agents (internal)
POST /api/agents/execute (internal, not exposed to client)
GET /api/agents/status

// WebSocket (for streaming)
WS /ws/commands/:id (subscribe to execution updates)
```

---

## 2.5 Security & Privacy

### Data Encryption

- **At Rest:** PostgreSQL native encryption (Supabase handles) + application-layer encryption for sensitive fields (API keys)
- **In Transit:** TLS 1.3 (HTTPS + WSS)
- **Keys:** Encrypted in Supabase secure vault, never logged

### Authentication & Authorization

- **OAuth 2.0** (Google sign-in only, no passwords)
- **JWT** for session tokens (signed, exp: 7 days)
- **Row-Level Security** (Supabase RLS policies: users can only access their own data)

### API Security

- **Rate Limiting:** 100 req/min per user (free tier), 1000 req/min (pro tier)
- **Input Validation:** Zod schema validation on all endpoints
- **CORS:** Restricted to verified domains only
- **CSRF Protection:** Built into Next.js framework

### Agent Safety

- **Sandboxing:** Terminal agent runs in isolated process with resource limits
- **Command Whitelist:** No system-level commands (no `rm -rf /`, no password reset)
- **Timeouts:** All agent executions timeout after 30 seconds
- **Audit Logging:** Every agent action logged with user_id + timestamp

---

## 2.6 Deployment Architecture

### Development Environment

```bash
# Local setup
docker-compose up -d  # PostgreSQL, Redis locally

npm install
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Production Environment

```
Frontend:
  Vercel (auto-deploy from main branch)
  - Next.js framework
  - Automatic SSL
  - Global CDN

Backend API:
  Vercel Functions (serverless) or Railway
  - Auto-scale based on load
  - Integrated with frontend

Database:
  Supabase (PostgreSQL, managed)
  - 99.99% uptime SLA
  - Auto-backups every 24h

Cache:
  Vercel KV (Redis)
  - Shared across all function instances

Monitoring:
  Sentry + UptimeRobot
  - Alert on errors
  - Track uptime
```

---

# 3. PHASED DEVELOPMENT PLAN

## Phase 1: MVP (8 Weeks)

### Goals
- Ship basic autonomous execution system
- Validate product-market fit
- Establish core architecture

### Scope

**Week 1-2: Foundation**
- [ ] Repository setup (GitHub, Next.js + Express starter)
- [ ] Environment & secrets management
- [ ] Database schema creation (User, Command, AgentExecution)
- [ ] OAuth setup (Google Sign-In)
- [ ] Deployment pipeline (Vercel + Railway)

**Week 3-4: Backend Core**
- [ ] Express API server scaffolding
- [ ] JWT + RLS implementation
- [ ] Command ingestion endpoint (POST /api/commands)
- [ ] WebSocket setup for streaming responses
- [ ] Rate limiting & quota enforcement

**Week 5-6: Agent System**
- [ ] Master Agent (Gemini API integration)
- [ ] File Agent (read, write, list)
- [ ] Terminal Agent (exec with safety constraints)
- [ ] Search Agent (Supabase full-text search)
- [ ] Tool executor & error handling

**Week 7-8: Frontend & Polish**
- [ ] React dashboard (command input, history, results)
- [ ] Real-time streaming UI (WebSocket rendering)
- [ ] Error handling & user feedback
- [ ] Testing (unit + integration)
- [ ] Documentation (API docs, setup guide)

### Deliverables

- [ ] GitHub repository (public, MIT license)
- [ ] Live MVP at signhify-ai.vercel.app
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Setup guide (local + cloud deployment)
- [ ] 100+ passing tests
- [ ] 50+ GitHub stars (initial community)

### Success Criteria

- MVP stable for 7 days (no crashes)
- 50+ sign-ups
- 10+ users completing 5+ commands
- <2s avg response time
- 95%+ command success rate

---

## Phase 2: Voice & Mobile (8 Weeks)

### Goals
- Add voice interface
- Support multilingual commands (English + Hindi)
- WhatsApp integration

### Scope

**Week 9-10: Voice Interface**
- [ ] Web Audio API integration
- [ ] Whisper API speech-to-text
- [ ] Web Speech API text-to-speech (fallback)
- [ ] Wake-word detection (optional, "Hey Signhify")
- [ ] Multi-language support (English + Hindi)

**Week 11-12: Advanced Agents**
- [ ] Coder Agent (code generation + explanation)
- [ ] Browser Agent (website scraping + reading)
- [ ] Research Agent (Tavily API integration)
- [ ] Image Generation Agent (Hugging Face)

**Week 13-14: WhatsApp Integration**
- [ ] WhatsApp Business API setup
- [ ] Message routing to agents
- [ ] Text-only response format
- [ ] Command queuing (WhatsApp doesn't support streaming)

**Week 15-16: Beta & Polish**
- [ ] Comprehensive testing (voice + WhatsApp)
- [ ] Localization (Hindi UI strings)
- [ ] Sponsorship tier setup (GitHub Sponsors)
- [ ] Community documentation

### Deliverables

- [ ] Voice command interface (live demo)
- [ ] WhatsApp command bot (working example)
- [ ] Coder + Browser + Research agents
- [ ] Hindi localization (UI + voice)
- [ ] Sponsorship page (with tiers)

### Success Criteria

- 500+ GitHub stars
- 100+ active users (monthly)
- 80%+ command success rate (including voice)
- 5+ GitHub Sponsors (any tier)
- Voice latency <3s (avg)

---

## Phase 3: Advanced Features (8 Weeks)

### Goals
- System automation & control
- User memory & personalization
- Community ecosystem (plugins)

### Scope

**Week 17-18: System Control**
- [ ] Window management
- [ ] Keyboard/mouse automation
- [ ] OCR integration (Tesseract.js)
- [ ] Screenshot capture

**Week 19-20: Memory & Macros**
- [ ] Memory graph implementation
- [ ] Custom macro creation (named workflows)
- [ ] Macro execution & scheduling
- [ ] User preferences & personalization

**Week 21-22: Plugin System**
- [ ] Plugin scaffold generator
- [ ] Community plugin marketplace (basic listing)
- [ ] Plugin upload & validation
- [ ] Example plugins (Zapier, Notion, Slack)

**Week 23-24: Ecosystem**
- [ ] Zapier/Make.com integration
- [ ] Telegram bot interface
- [ ] Team accounts & collaboration
- [ ] Advanced analytics dashboard

### Deliverables

- [ ] System automation toolkit
- [ ] Memory graph visualizer
- [ ] Plugin marketplace (MVP)
- [ ] Team collaboration features
- [ ] Ecosystem integrations

### Success Criteria

- 1000+ GitHub stars
- 200+ active users
- 50+ macros created by users
- 10+ community plugins
- $500/month revenue (sponsorships)

---

# 4. REPOSITORY & DEVOPS STRUCTURE

## 4.1 Repository Layout

```
signhify-ai/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml (lint + test)
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE/
│   │   └── default.md
│   └── dependabot.yml
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx (dashboard)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth].ts
│   │       │   └── callback/google.ts
│   │       └── commands/
│   │           └── route.ts (proxy to backend)
│   ├── components/
│   │   ├── CommandInput.tsx
│   │   ├── CommandHistory.tsx
│   │   ├── ResponseStream.tsx
│   │   ├── VoiceInput.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useCommands.ts
│   │   ├── useAuth.ts
│   │   └── useWebSocket.ts
│   ├── lib/
│   │   ├── api.ts (client-side API calls)
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── main.ts (entry point)
│   │   ├── config/
│   │   │   ├── env.ts (environment validation)
│   │   │   ├── database.ts (Supabase client)
│   │   │   └── redis.ts (Redis client)
│   │   ├── auth/
│   │   │   ├── middleware.ts (JWT verification)
│   │   │   ├── oauth.ts (Google OAuth flow)
│   │   │   └── utils.ts
│   │   ├── api/
│   │   │   ├── routes.ts (all route definitions)
│   │   │   ├── commands.ts (command endpoints)
│   │   │   ├── files.ts (file management)
│   │   │   ├── user.ts (profile + settings)
│   │   │   └── agents.ts (internal agent calls)
│   │   ├── agents/
│   │   │   ├── master.ts (orchestrator)
│   │   │   ├── file.ts
│   │   │   ├── terminal.ts
│   │   │   ├── search.ts
│   │   │   ├── browser.ts
│   │   │   ├── coder.ts
│   │   │   └── research.ts
│   │   ├── tools/
│   │   │   ├── executor.ts (base tool executor)
│   │   │   ├── types.ts
│   │   │   └── registry.ts (tool registry)
│   │   ├── db/
│   │   │   ├── schema.ts (database types)
│   │   │   ├── migrations/
│   │   │   │   └── init.sql
│   │   │   └── queries.ts (helper queries)
│   │   ├── utils/
│   │   │   ├── logger.ts (Pino logger)
│   │   │   ├── errors.ts (custom error classes)
│   │   │   ├── validators.ts (Zod schemas)
│   │   │   └── helpers.ts
│   │   └── types/
│   │       ├── index.ts (main types)
│   │       ├── api.ts
│   │       ├── agents.ts
│   │       └── db.ts
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── agents.test.ts
│   │   │   ├── api.test.ts
│   │   │   └── utils.test.ts
│   │   ├── integration/
│   │   │   ├── commands.test.ts
│   │   │   └── agents.test.ts
│   │   └── setup.ts (test configuration)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── architecture/
│   │   └── ARCHITECTURE.md
│   ├── development/
│   │   ├── SETUP.md (local development)
│   │   ├── CONTRIBUTING.md
│   │   └── TESTING.md
│   ├── deployment/
│   │   ├── VERCEL.md
│   │   ├── RAILWAY.md
│   │   └── SELF_HOSTED.md
│   ├── api/
│   │   ├── openapi.yaml
│   │   └── ENDPOINTS.md
│   ├── agents/
│   │   ├── AGENT_GUIDE.md
│   │   └── CREATING_CUSTOM_AGENTS.md
│   ├── user-guide/
│   │   ├── GETTING_STARTED.md
│   │   ├── COMMANDS.md (command syntax)
│   │   └── FAQ.md
│   └── CHANGELOG.md
│
├── .gitignore
├── .env.example
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE (MIT)
└── package.json (root workspace)
```

---

# 5. ETHICAL REVERSE ENGINEERING GUIDE

## 5.1 What "Reverse Engineering" Means Here

**Definition:** Studying the IRIS ecosystem to understand design patterns, architecture decisions, and user experience flows — then building a **legally distinct** product that solves the same problem differently.

**NOT:** Copying code, cloning design, or re-licensing protected assets.

---

## 5.2 Legal & Ethical Framework

### ✅ What You CAN Do

- **Study IRIS source code** (publicly available on GitHub under MIT)
- **Learn from architecture patterns** (LangGraph, agent orchestration)
- **Understand user workflows** (how voice-first systems work, agent routing)
- **Reference design principles** (modular agents, real-time execution, safety sandboxing)
- **Build inspired-by systems** (using different tech stack, distinct UI/UX, different positioning)
- **Cite IRIS as inspiration** (in README: "Inspired by IRIS architecture")

### ❌ What You CANNOT Do

- **Copy code verbatim** (MIT requires attribution, but best to rewrite)
- **Use IRIS's protected components** (bytecode, voice engine if proprietary)
- **Claim original authorship** (of ideas inspired by IRIS)
- **License under stricter terms** (MIT components must stay MIT)
- **Pass off IRIS examples as your own** (always attribute)

### Legal Basis

- **MIT License** (IRIS public core) requires: attribution + no liability
- **Copyright Law** (personal to Harsh Pandey): protects original expression, not ideas
- **Fair Use** (US/India): learning, commentary, reverse engineering for interoperability is defensible
- **India IP Act, 1957**: Similar fair dealing provisions for study/review

---

## 5.3 Step-by-Step Reverse Engineering Process

### Step 1: Audit & Mapping (Week 1)

**Goal:** Understand IRIS completely without copying.

```bash
# 1. Read all public documentation
- Clone https://github.com/IRISX-AI/IRIS-AI.git
- Read README.md → understand positioning, features
- Read docs/ → architecture, tech stack, features
- Review GitHub issues → understand pain points solved

# 2. Map architecture (diagram it yourself)
- What layers exist? (frontend, API, agent, database)
- How do agents communicate? (message queue? direct call? graph?)
- What's the security model? (bytecode, ASAR, IPC isolation?)
- How does scaling work? (serverless? containers? message queue?)

# 3. Identify inspirational patterns
- LangGraph for agent orchestration
  → Decision: Use same (it's open-source, standard in industry)
- Gemini API as primary LLM
  → Decision: Same choice (popular, free tier exists)
- Electron + React desktop app
  → Decision: Go web-first instead (Next.js), differentiate from IRIS's desktop focus
- WhatsApp as integration point
  → Decision: Adopt same approach (logical for India market)
- Open Core + Sponsorship tiers
  → Decision: Adopt (sustainable, community-aligned)

# 4. Create comparison matrix
| Aspect | IRIS | Signhify AI | Rationale |
| --- | --- | --- | --- |
| Primary UX | Electron desktop | Web-first (Next.js) | Lower friction, mobile-friendly, India-friendly |
| Language support | English | English + Hindi | Regional market fit |
| Positioning | "Neural OS" | "AI Co-Engineer" | Different framing, less "system-level" |
| Licensing | MIT (public) + commercial (private) | MIT (public) + sponsorship (open model) | More transparent, community-friendly |
| First agent | Master Agent | Master Agent | Industry standard, no alternative |
| Database | Windows local + cloud | PostgreSQL (web-based) | Align with web-first architecture |
| Pricing | Free + $5-$50 sponsors | Free + $0-$30 sponsorship (optional) | More flexible, India price sensitivity |
```

---

### Step 2: Design Distinct Architecture (Week 2)

**Goal:** Make deliberate, documented differences from IRIS.

```
IRIS Architecture:
┌─────────────┐
│ Electron UI │
└──────┬──────┘
       │ IPC
       ▼
┌──────────────────┐
│ Node.js Backend  │ (System access, file control, automation)
└──────┬───────────┘
       │
       ▼
    [LLM APIs]

Signhify AI Architecture (DIFFERENT):
┌──────────────────────────────────────────┐
│ React (Next.js) Dashboard + Web App       │ (Web-first, mobile, responsive)
└────────────────┬─────────────────────────┘
                 │ REST API + WebSocket
                 ▼
┌───────────────────────────────────────────┐
│ Express.js Backend (Vercel Functions)     │ (Serverless, scalable)
└────────────────┬────────────────────────┬─┘
             ... continues ...
```

---

### Step 3: Reference Code Rewrite (Week 3)

**Goal:** Rewrite any "inspired" logic in your own style.

```typescript
// ❌ DON'T: Copy IRIS's agent structure directly
// ✅ DO: Rewrite with your own abstractions

class SignhifyAgent {
  private graph: StateGraph<AgentState>;
  
  async process(userCommand: string, context: UserContext) {
    // 1. Parse into task graph (different abstraction)
    const tasks = await this.planTasks(userCommand, context);
    
    // 2. Build execution graph (LangGraph, but your design)
    this.graph = new StateGraph()
    // ... your implementation
  }
}
```

---

### Step 4: UX & Design Differentiation (Week 3)

**Goal:** Make UI/UX distinctly Signhify, not IRIS-like.

```
IRIS UI:
- Dark theme (neon emerald #10b981)
- 3D sphere visualization (Three.js)
- Floating widgets scattered
- System-centric (Windows focus)

Signhify AI UI (DIFFERENT):
- Light/dark toggle (Tailwind)
- Simple, card-based layout (not 3D)
- Organized dashboard (sidebar + main)
- Web-native (responsive, mobile-first)
- Hindi text support natively
```

---

## 5.4 Reverse Engineering Checklist

### Legal Compliance

- [ ] Read IRIS MIT license fully (understand attribution requirements)
- [ ] Review Harsh Pandey's SECURITY.md + CONTRIBUTING.md (respect boundaries)
- [ ] Check for any "do not fork" notices (there are none, it's MIT)
- [ ] Document all inspiration sources (GitHub issue, blog, docs, video)
- [ ] Create INSPIRATION.md file linking to all references

### Technical Differentiation

- [ ] Pick different primary tech stack choices (web vs. desktop, different DB, etc.)
- [ ] Rewrite any borrowed algorithm in your own code style
- [ ] Use different library implementations where possible
- [ ] Create distinct API contract (different endpoint naming, structure)
- [ ] Design different data models (even if conceptually similar)
- [ ] Write custom agent implementations (not copy-paste)

### Design & UX

- [ ] Create original color scheme (document why different)
- [ ] Design original UI layout (wireframes, not screenshots of IRIS)
- [ ] Use different icon set, typography
- [ ] Create distinct user onboarding flow
- [ ] Different dashboard layout/organization

### Documentation

- [ ] Document "Inspiration" section in README
- [ ] Link to IRIS repository (give credit)
- [ ] Clearly state what's inspired vs. what's original
- [ ] Add "Reverse Engineering Philosophy" guide in docs/
- [ ] Acknowledge any copied algorithms/patterns with citations

### Code Review

- [ ] Run similarity checker (code plagiarism tool)
- [ ] Have peer review for "inspired" sections
- [ ] Add code comments where patterns match IRIS

### Community & Communication

- [ ] Join IRIS Discord/community (learn from builders)
- [ ] Link back to IRIS in your GitHub bio
- [ ] Tweet appreciation to @IrisAI team
- [ ] If IRIS builds similar features later, don't claim original first
- [ ] Contribute back to IRIS if you improve patterns

---

# 6. DELIVERABLES CHECKLIST BY PHASE

## Phase 1 Deliverables (MVP, 8 weeks)

### Documentation
- [ ] **PRD v1.0** (this document, finalized)
- [ ] **TRD v1.0** (architecture, APIs, data models)
- [ ] **API Documentation** (Swagger/OpenAPI file, auto-generated from code)
- [ ] **Setup Guide** (local dev + Vercel + Railway deployment)
- [ ] **CONTRIBUTING.md** (contribution guidelines for open-source)
- [ ] **Architecture Diagram** (SVG or ASCII, checked into repo)
- [ ] **Entity-Relationship Diagram (ERD)** (database schema visual)

### Code & Infrastructure
- [ ] **GitHub Repository** (public, MIT license, GitHub Pages docs site)
- [ ] **Frontend Codebase** (React components, API client, styles)
- [ ] **Backend Codebase** (Express server, agents, tools, middleware)
- [ ] **Docker Setup** (Dockerfile + docker-compose.yml for local dev)
- [ ] **Database Migrations** (SQL scripts, Supabase migrations)
- [ ] **Environment Configuration** (.env.example files, secrets management)
- [ ] **CI/CD Pipelines** (GitHub Actions workflows)

### Features (MVP)
- [ ] **Web Dashboard** (React app with command input, history, results)
- [ ] **Google OAuth** (login/signup, JWT auth)
- [ ] **Master Agent** (Gemini API integration, basic intent parsing)
- [ ] **File Agent** (read, write, list directory)
- [ ] **Terminal Agent** (execute shell commands safely)
- [ ] **Search Agent** (full-text + semantic search)
- [ ] **WebSocket Streaming** (real-time response UI updates)
- [ ] **Error Handling** (graceful failures, user-friendly error messages)

### Testing
- [ ] **Unit Tests** (>80% code coverage, agents + utilities)
- [ ] **Integration Tests** (end-to-end command execution)
- [ ] **API Tests** (endpoint validation, auth, rate limiting)
- [ ] **Security Tests** (CORS, XSS, injection vulnerabilities)
- [ ] **Load Test** (100 concurrent users, latency distribution)

### Deployment
- [ ] **Vercel Deployment** (frontend live at signhify-ai.vercel.app)
- [ ] **Railway Deployment** (backend API live)
- [ ] **Supabase Setup** (PostgreSQL database, RLS policies, backups)
- [ ] **Redis/KV Store** (Vercel KV or Railway Redis)
- [ ] **SSL Certificates** (auto-managed by Vercel)
- [ ] **Monitoring** (Sentry error tracking, UptimeRobot uptime)

### Launch Assets
- [ ] **Logo & Branding** (SVG logo, brand guidelines)
- [ ] **README.md** (compelling overview, quick start, feature list)
- [ ] **Demo Video** (60 seconds, showing 3-4 commands)
- [ ] **Blog Post** (launching Signhify AI, inspiration story)
- [ ] **Social Media Assets** (Twitter banner, LinkedIn image)
- [ ] **Community** (GitHub Discussions enabled, Discord server optional)

---

# 7. RISK, COMPLIANCE & LICENSING

## 7.1 Risk Assessment & Mitigation

| Risk | Severity | Likelihood | Mitigation |
| --- | --- | --- | --- |
| **Copy claims from IRIS founder** | High | Low | Clear attribution, distinct architecture, legal review |
| **Open-source license violation** | High | Very Low | Audit all dependencies, bot checks (Renovate/Dependabot) |
| **Security vulnerability in agents** | Critical | Medium | Sandboxing, timeouts, input validation, penetration testing |
| **API quota overage (Gemini free tier)** | High | Medium | Rate limiting per user, fallback to Groq API, cache responses |
| **User data breach** | Critical | Low | Supabase encryption, RLS policies, regular security audits |
| **WhatsApp API suspension** | Medium | Low | Document business use case, follow WhatsApp ToS strictly |
| **Insufficient funding for domain/hosting** | Medium | Medium | Free-tier stack chosen, community sponsorship model |
| **Community fragmentation** | Medium | Low | Clear governance, transparent decisions, community surveys |
| **Agent hallucinations causing data loss** | Critical | Medium | Dry-run mode, user confirmation for destructive ops, undo history |

---

## 7.2 Licensing Strategy

### Signhify AI Licensing Model

```
┌───────────────────────────────────────────────────────────────┐
│                  SIGNHIFY AI DUAL LICENSE MODEL               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  LAYER 1: PUBLIC SOURCE (Free to all)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ License: MIT                                        │    │
│  │ Files: Entire frontend/, most of backend/          │    │
│  │ Usage: Study, modify, redistribute (with credit)   │    │
│  │ Restrictions: No liability, must keep MIT header   │    │
│  │                                                     │    │
│  │ GitHub: public repository, source always visible  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  LAYER 2: OPTIONAL SPONSORSHIP (Free to evaluate)           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ License: Sponsor Agreement (custom)                 │    │
│  │ Access: Private repo (iris-insiders, iris-alpha)   │    │
│  │ Content: Examples, guides, architecture docs       │    │
│  │ Not included: Core source (already public)          │    │
│  │ Purpose: Fund development, support building        │    │
│  │                                                     │    │
│  │ Does NOT restrict use of public MIT code           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  LAYER 3: COMMERCIAL LICENSE (Future, for enterprises)      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ License: Custom Commercial (if needed)              │    │
│  │ Usage: Self-hosted deployment, custom agents        │    │
│  │ Support: SLA, dedicated help, private patches       │    │
│  │ Price: $1000-$5000/year (negotiated)                │    │
│  │                                                     │    │
│  │ Available ONLY if legally requested                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  IMPORTANT: Public MIT code is ALWAYS free, MIT.            │
│  Sponsorships are OPTIONAL, not required to use software.   │
└───────────────────────────────────────────────────────────────┘
```

### Why This Model?

1. **Community-First:** MIT license allows anyone to fork, learn, improve
2. **Sustainability:** Sponsorship tiers fund development without paywalls
3. **Trust:** No hidden restrictions, no GPL copyleft "license creep"
4. **Inspiration:** Explicitly borrowed from IRIS, respects Harsh's model
5. **Simplicity:** No "personal use vs. commercial" confusion (MIT is MIT)

---

# 8. FREE TECH STACK RECOMMENDATION

## 8.1 Complete Free-Tier Stack (India-Optimized)

### Problem Statement
Indian builders often can't afford $50+/month for hosting. This stack is **100% free forever**, scales to meaningful usage, with clear upgrade paths when you need them.

---

### Frontend (Vercel)

**Choice:** Next.js 15 (App Router) on Vercel

```yaml
Platform: Vercel
Cost: Free tier
  - 100GB bandwidth/month
  - Serverless functions (1000 requests/day, sufficient for MVP)
  - Auto-scaling (handles traffic spikes)
  - Auto SSL (HTTPS included)
  - Global CDN (fast loads worldwide + India)

Limits:
  - Serverless function max duration: 10 seconds (Hobby plan)
  - Suitable for: Chat API calls, auth, static generation

When to upgrade:
  - >1000 deployments/month → Pro ($20/month)
  - Need >10s function timeout → Pro ($20/month)
  - Need for production (recommended) → Pro ($20/month)
```

---

### Backend API (Railway)

**Choice: Railway (Recommended for India)**

```yaml
Platform: Railway
Cost: Free tier + $5/month credit (after free trial)
  - $5/month covers ~2 small services:
    - Node.js API server
    - PostgreSQL database replica
  - Auto-deploys from GitHub
  - Free SSL, global CDN
  - Volume mounts (persistent storage)

Limits:
  - Free tier: $5/month credit (enough for MVP)
  - If you exceed: Pay-as-you-go (~$5 per service, per month)
  - No hard limits, just metered usage

Calculation:
  - Node.js service: ~$2/month (shared CPU, 512MB RAM)
  - PostgreSQL: ~$2/month (shared instance, 100MB)
  - Total: ~$4/month (within free credit)
```

---

### Database (Supabase)

**Choice:** Supabase (PostgreSQL + Real-time)

```yaml
Platform: Supabase
Cost: Free tier
  - Database: 500MB storage, 2GB bandwidth/month
  - Real-time subscriptions: Included
  - Row-level security: Included
  - Vector similarity (pgvector): Included
  - Unlimited API calls (rate-limited)

What's included:
  ✅ PostgreSQL 15 (fully managed)
  ✅ Auth (Google OAuth built-in)
  ✅ Real-time: WebSocket subscriptions
  ✅ Row-Level Security (RLS) for multi-tenancy
  ✅ pgvector (for embeddings, memory graph)
  ✅ Full-text search
  ✅ Auto-backups (daily)

Limits:
  - 500MB storage: ~100k commands + user profiles
  - 2GB bandwidth: ~1000 users/month (plenty for MVP)
  - Soft rate limit: ~200 requests/second (unlikely to hit)

When to upgrade:
  - >500MB data → Pro ($25/month)
  - Need higher bandwidth → Pro
  - Need dedicated support → Pro
```

---

### Cache & Job Queue (Redis)

**Choice: Railway Redis (Recommended)**

```yaml
Platform: Railway Redis
Cost: Free tier
  - Redis instance: $0 with Railway $5 credit
  - Bull job queue: Full support
  - Caching: Sessions, file index
  - Queue persistence: Logs on disk

Setup:
  - Add Redis to Railway project: 1 click
  - NODE_ENV: Set REDIS_URL in environment
  - Bull: Automates job retries, scheduling

Limits:
  - 256MB memory: Sufficient for MVP
  - Eviction policy: LRU (old data removed when full)
```

---

### AI & LLM APIs

#### Primary: Google Gemini API

```yaml
Provider: Google AI Studio (Gemini)
Cost: Free tier
  - 60 requests/minute (free)
  - 1 million tokens/month (free, generous)
  - Gemini 1.5 Pro: Same free tier

Calculation (MVP usage):
  - 100 users × 30 commands/month = 3,000 commands
  - Avg tokens per command: ~2,000 (prompt + response)
  - Total: 6M tokens/month
  - Free tier: 1M tokens/month
  - Overage: $0.075 per 1M tokens (~$0.38/month for overage)

Estimate: FREE (within 1M free tokens) or <$1/month
```

---

### Speech-to-Text (Whisper)

**Choice: Deepgram (Better for India)**

```yaml
Provider: Deepgram
Cost: FREE tier
  - 23,000 minutes/month (free)
  - Perfect for MVP
  - No credit card required

Recommendation: Deepgram (free, more generous than Whisper)
```

---

### Web Search

**Choice: Tavily Search API (Free tier)**

```yaml
Provider: Tavily
Cost: Free tier
  - 1,000 searches/month (free)
  - After: $0.005 per search ($5 per 1000)

Usage:
  - Research Agent: 10 searches/user/month × 100 users = 1000 searches
  - Fits within free tier!

Estimate: FREE (within free tier)
```

---

### Image Generation

**Choice: Hugging Face Inference API (FREE)**

```yaml
Provider: Hugging Face
Cost: Free tier
  - Stable Diffusion v1.5 (free, no auth)
  - Rate-limited (queue if busy)
  - No API key required

Recommendation: HF for MVP (free, good quality)
```

---

## 8.2 Total Cost of Ownership (Year 1)

```
┌─────────────────────────────────────────────────────────┐
│           FREE-TIER COST BREAKDOWN                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Frontend (Vercel)              FREE ($0/month)         │
│ Backend (Railway)              FREE ($0/month)         │
│ Database (Supabase)            FREE ($0/month)         │
│ Cache (Railway Redis)          FREE ($0/month)         │
│ LLM (Gemini)                   FREE ($0/month)         │
│ Vector Search (pgvector)       FREE ($0/month)         │
│ Voice (Deepgram)               FREE ($0/month)         │
│ TTS (Web Speech API)           FREE ($0/month)         │
│ Search (Tavily)                FREE ($0/month)         │
│ Images (HF Inference)          FREE ($0/month)         │
│ Monitoring (Sentry)            FREE ($0/month)         │
│ Uptime (UptimeRobot)           FREE ($0/month)         │
│                                                         │
│ Domain Name (namecheap)        $9/year (~$0.75/month) │
│ SSL Certificate                FREE (Vercel)           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ TOTAL YEAR 1:                  ~$10 (domain only)      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ When you reach 1,000+ users, upgrade to:               │
│ - Vercel Pro: $20/month                                │
│ - Railway: $0 (still covered by credit)                │
│ - Supabase Pro: $25/month                              │
│ TOTAL: ~$45/month (supporting 1000s of users)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 9. MVP OUTLINE & BOOTSTRAP

## 9.1 MVP Scope (What Ships in Week 8)

### User Stories

```gherkin
Feature: User Authentication
  Scenario: New user signs up
    Given user visits signhify-ai.vercel.app
    When user clicks "Sign in with Google"
    And user authorizes with Google
    Then user is logged in
    And dashboard is shown

Feature: Execute Commands
  Scenario: User runs a file command
    Given user is logged in
    When user types "List files in ~/projects"
    And user presses Enter
    Then command is sent to backend
    And agents execute the command
    And result is shown in real-time (streaming)
    And response is saved to history

Feature: View Command History
  Scenario: User views past commands
    Given user is logged in
    When user clicks "History"
    Then all past 100 commands are shown
    And each shows status (completed, failed)
    And user can click to view details (trace)

Feature: Error Handling
  Scenario: Command fails
    Given command execution encounters an error
    When error occurs in any agent
    Then user sees friendly error message
    And execution trace shows where it failed
    And user can retry
```

---

## 9.2 Database Schema (Supabase SQL)

```sql
-- Users table
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT check_tier CHECK (tier IN ('free', 'supporter', 'pro', 'enterprise'))
);

-- Commands table
CREATE TABLE public.commands (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  input_type TEXT DEFAULT 'text',
  status TEXT DEFAULT 'pending',
  result JSONB,
  agents_used TEXT[],
  execution_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT check_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Agent executions table
CREATE TABLE public.agent_executions (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  command_id UUID NOT NULL REFERENCES public.commands(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  input JSONB,
  output JSONB,
  error TEXT,
  duration_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Indexes for performance
CREATE INDEX idx_commands_user_id ON public.commands(user_id);
CREATE INDEX idx_commands_status ON public.commands(status);
CREATE INDEX idx_commands_created_at ON public.commands(created_at DESC);
CREATE INDEX idx_agent_executions_command_id ON public.agent_executions(command_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own commands"
  ON public.commands
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own commands"
  ON public.commands
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own agent executions"
  ON public.agent_executions
  FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM public.commands
      WHERE id = command_id
    )
  );
```

---

# 10. EXAMPLE CODE SCAFFOLDS & STARTER DATA MODELS

## 10.1 Backend Starter (Express + TypeScript)

### `/backend/src/main.ts`

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { WebSocketServer } from "ws";
import { createServer } from "http";

// Initialize
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests, please try again later",
});
app.use("/api/", limiter);

// Auth middleware
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes
import commandRoutes from "./api/commands";
import authRoutes from "./api/auth";

app.use("/api/commands", verifyAuth, commandRoutes);
app.use("/api/auth", authRoutes);

// WebSocket
wss.on("connection", (ws, req) => {
  const commandId = new URL(req.url!, `http://${req.headers.host}`).searchParams.get("id");
  console.log(`Client connected to command ${commandId}`);

  ws.on("close", () => console.log("Client disconnected"));
});

// Server start
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export { app, wss };
```

---

### `/backend/src/api/commands.ts`

```typescript
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import { MasterAgent } from "../agents/master";
import { logger } from "../utils/logger";

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const masterAgent = new MasterAgent();

// POST /api/commands - Create and execute command
router.post("/", async (req, res) => {
  try {
    const { content, input_type = "text" } = req.body;
    const user_id = req.user.id;
    const command_id = uuidv4();

    // Validate
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Command content is required" });
    }

    // Insert command record
    const { error: insertError } = await supabase.from("commands").insert([
      {
        id: command_id,
        user_id,
        input: content,
        status: "running",
        input_type,
      },
    ]);

    if (insertError) throw insertError;

    res.status(200).json({ command_id, status: "running" });

    // Execute asynchronously
    (async () => {
      try {
        const result = await masterAgent.process(content, {
          user_id,
          command_id,
        });

        // Update command with result
        await supabase
          .from("commands")
          .update({
            status: "completed",
            result,
            execution_time_ms: Date.now(),
          })
          .eq("id", command_id);

        logger.info(`Command ${command_id} completed`, result);
      } catch (error) {
        logger.error(`Command ${command_id} failed`, error);
        await supabase
          .from("commands")
          .update({
            status: "failed",
            result: { error: error.message },
          })
          .eq("id", command_id);
      }
    })();
  } catch (error) {
    logger.error("Command creation error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/commands/:id - Get command details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("commands")
      .select("*")
      .eq("id", id)
      .eq("user_id", user_id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Command not found" });

    res.json(data);
  } catch (error) {
    logger.error("Command fetch error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/commands - List user's commands
router.get("/", async (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from("commands")
      .select("*", { count: "exact" })
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({ commands: data, total: count, limit, offset });
  } catch (error) {
    logger.error("Commands list error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
```

---

### `/backend/src/agents/master.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileAgent } from "./file";
import { TerminalAgent } from "./terminal";
import { SearchAgent } from "./search";

interface AgentContext {
  user_id: string;
  command_id: string;
}

export class MasterAgent {
  private model: any;
  private agents: Record<string, any>;

  constructor() {
    this.model = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    ).getGenerativeModel({ model: "gemini-1.5-pro" });

    this.agents = {
      file: new FileAgent(),
      terminal: new TerminalAgent(),
      search: new SearchAgent(),
    };
  }

  async process(userCommand: string, context: AgentContext): Promise<any> {
    // Step 1: Parse intent
    const intentPrompt = `
      User command: "${userCommand}"
      
      Available agents: ${Object.keys(this.agents).join(", ")}
      
      Parse the user's intent and identify which agents are needed.
      Respond in JSON format:
      {
        "intent": "what user wants",
        "agents_needed": ["agent1", "agent2"],
        "parameters": { ... }
      }
    `;

    const intentResponse = await this.model.generateContent(intentPrompt);
    const intentJson = JSON.parse(
      intentResponse.response.text().match(/\{[\s\S]*\}/)[0]
    );

    // Step 2: Execute agents
    const results = {};
    for (const agentName of intentJson.agents_needed) {
      const agent = this.agents[agentName];
      if (agent) {
        try {
          results[agentName] = await agent.execute(
            userCommand,
            intentJson.parameters
          );
        } catch (error) {
          results[agentName] = { error: error.message };
        }
      }
    }

    // Step 3: Synthesize results
    const synthesisPrompt = `
      User command: "${userCommand}"
      
      Agent results:
      ${JSON.stringify(results, null, 2)}
      
      Synthesize these results into a clear, user-friendly response.
      Format appropriately (list, summary, code, etc.)
    `;

    const synthesisResponse = await this.model.generateContent(synthesisPrompt);

    return {
      agents_used: intentJson.agents_needed,
      results,
      summary: synthesisResponse.response.text(),
    };
  }
}
```

---

## 10.2 Frontend Starter (Next.js)

### `/frontend/app/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CommandInput from '@/components/CommandInput';
import ResponseStream from '@/components/ResponseStream';
import CommandHistory from '@/components/CommandHistory';

interface Command {
  id: string;
  content: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentCommand, setCurrentCommand] = useState<Command | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth');
        return;
      }

      // Fetch user
      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        // Fetch commands
        const cmdRes = await fetch('/api/commands', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { commands: userCommands } = await cmdRes.json();
        setCommands(userCommands);
      } else {
        router.push('/auth');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleNewCommand = async (content: string) => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch('/api/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, input_type: 'text' }),
    });

    const { command_id } = await res.json();
    const newCommand: Command = {
      id: command_id,
      content,
      status: 'running',
      created_at: new Date().toISOString(),
    };

    setCurrentCommand(newCommand);
    setCommands([newCommand, ...commands]);

    // Subscribe to WebSocket updates
    const ws = new WebSocket(`ws://localhost:3001/ws/commands/${command_id}`);
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setCurrentCommand((prev) => ({
        ...prev,
        ...update,
      }));
    };
    ws.onerror = () => {
      setCurrentCommand((prev) => ({
        ...prev,
        status: 'failed',
      }));
    };
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">Recent Commands</h2>
        <CommandHistory commands={commands} onSelect={setCurrentCommand} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Signhify AI</h1>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              router.push('/auth');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 gap-6">
          <CommandInput onSubmit={handleNewCommand} />
          {currentCommand && <ResponseStream command={currentCommand} />}
        </div>
      </div>
    </div>
  );
}
```

---

## 10.3 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/Signhify/signhify-ai.git
cd signhify-ai
npm install

# Setup environment
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Start Docker services
docker-compose up -d

# Run development servers
npm run dev

# Expected output:
# ✅ Frontend: http://localhost:3000
# ✅ Backend: http://localhost:3001
# ✅ Database: localhost:5432
# ✅ Redis: localhost:6379
```

---

## Conclusion

You now have a complete, actionable blueprint for building Signhify AI. This document covers:

✅ Complete PRD (product vision, users, features, timeline)
✅ Complete TRD (architecture, APIs, data models, tech stack)
✅ Phased development plan (8 weeks MVP → 24 weeks full)
✅ Repository structure (organized, CI/CD-ready)
✅ Ethical reverse engineering guide (legal, compliant, attributed)
✅ Deliverables checklist (what to ship each phase)
✅ Compliance & licensing framework (GDPR, India-ready, MIT license)
✅ Free tech stack (100% free, scales to 1000+ users)
✅ MVP outline (core features, data models, API)
✅ Code scaffolds (backend, frontend, database ready to copy-paste)

**Build fast. Ship often. Listen to users.**

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Production-Ready ✅
