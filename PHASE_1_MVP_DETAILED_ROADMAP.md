# 📅 Signhify AI Phase 1: MVP Development Roadmap

**Timeline:** 8 weeks (Jan - Mar 2026)  
**Goal:** Ship fully functional autonomous execution system with 4 core agents

---

## Week 1-2: Foundation & Setup

### Objectives
- Repository initialization
- Infrastructure provisioning
- Database schema creation
- Deployment pipelines

### Tasks

#### Repository Setup
- [ ] Create GitHub organization: `Signhify/` (if not exists)
- [ ] Create main repository: `signhify-ai`
- [ ] Clone template repo (with Next.js + Express starter)
- [ ] Setup branch protection rules (main branch)
- [ ] Configure GitHub Discussions (for community)
- [ ] Add README.md skeleton
- [ ] Add MIT LICENSE file
- [ ] Add CONTRIBUTING.md guidelines
- [ ] Setup GitHub Pages (for documentation site)

#### Infrastructure & Secrets
- [ ] Create Vercel project (frontend)
- [ ] Create Railway project (backend)
- [ ] Create Supabase project
- [ ] Generate API keys:
  - [ ] Google Gemini API key
  - [ ] Groq API key
  - [ ] Tavily Search API key
  - [ ] Deepgram API key (optional, Phase 2)
- [ ] Setup environment variables in:
  - [ ] Vercel: `NEXT_PUBLIC_*` vars
  - [ ] Railway: `DATABASE_URL`, `REDIS_URL`, etc.
  - [ ] GitHub Secrets: for CI/CD
- [ ] Create `.env.example` files (committed to repo)

#### Database Setup (Supabase)
- [ ] Run migrations (schema creation)
  - [ ] `users` table
  - [ ] `commands` table
  - [ ] `agent_executions` table
- [ ] Setup RLS (Row Level Security) policies
- [ ] Create indexes on frequently queried columns
- [ ] Configure auto-backups
- [ ] Test connection from backend

#### CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`
  - [ ] Lint (ESLint + Prettier)
  - [ ] Build (Next.js + Express)
  - [ ] Test (unit + integration)
  - [ ] Code coverage reporting
- [ ] Create `.github/workflows/deploy-staging.yml`
  - [ ] Deploy to Vercel Preview
  - [ ] Deploy to Railway Staging
  - [ ] Run smoke tests
- [ ] Create `.github/workflows/deploy-production.yml`
  - [ ] Deploy to Vercel Production
  - [ ] Deploy to Railway Production
  - [ ] Notify on Slack
- [ ] Test CI/CD with dummy commit

#### Local Development
- [ ] Create `docker-compose.yml` for local PostgreSQL + Redis
- [ ] Create `setup-dev.sh` script
- [ ] Test setup: `npm install` → `docker-compose up -d` → `npm run dev`
- [ ] Document in SETUP.md

### Deliverables
- [ ] Public GitHub repository with MIT license
- [ ] Infrastructure provisioned (Vercel, Railway, Supabase)
- [ ] All environment variables configured
- [ ] CI/CD pipelines working
- [ ] Local development setup documented

### Success Criteria
- [ ] `npm run dev` works locally (frontend + backend start)
- [ ] Database connection works
- [ ] GitHub Actions workflows pass on first commit

---

## Week 3-4: Backend Core & Authentication

### Objectives
- Express server scaffold
- Google OAuth integration
- JWT-based authentication
- WebSocket for real-time updates
- Rate limiting & quota system

### Tasks

#### Express Server Scaffold
- [ ] Create `/backend/src/main.ts`
  - [ ] Initialize Express app
  - [ ] Setup middleware (helmet, CORS, compression)
  - [ ] Error handling middleware
  - [ ] Logging middleware (Pino)
- [ ] Create `/backend/src/config/`
  - [ ] `env.ts` — environment variable validation (Zod)
  - [ ] `database.ts` — Supabase client initialization
  - [ ] `redis.ts` — Redis client (Bull queue)
- [ ] Setup TypeScript strict mode + linting

#### Authentication
- [ ] Google OAuth flow
  - [ ] Create `/backend/src/auth/oauth.ts`
  - [ ] Setup OAuth 2.0 redirect flow
  - [ ] Create user on first login
  - [ ] Return JWT token
- [ ] JWT verification middleware
  - [ ] Create `/backend/src/auth/middleware.ts`
  - [ ] Verify token on protected routes
  - [ ] Extract user_id from token
- [ ] Create `/api/auth/` endpoints
  - [ ] `POST /api/auth/callback/google` (OAuth callback)
  - [ ] `POST /api/auth/logout` (invalidate token)
  - [ ] `GET /api/auth/user` (current user info)

#### Command Ingestion API
- [ ] Create `/backend/src/api/commands.ts`
  - [ ] `POST /api/commands` (create command)
    - [ ] Validate input (Zod schema)
    - [ ] Insert into database (status: pending)
    - [ ] Return command_id
    - [ ] Trigger agent execution (async, fire-and-forget)
  - [ ] `GET /api/commands` (list with pagination)
  - [ ] `GET /api/commands/:id` (detailed view + execution trace)
  - [ ] `DELETE /api/commands/:id` (soft delete, only own)

#### WebSocket Real-Time Updates
- [ ] Create `/backend/src/websocket/handler.ts`
  - [ ] `WS /ws/commands/:id` (subscribe to command updates)
  - [ ] Stream execution progress in real-time
  - [ ] Send `{ status, result, agents_used, trace }` as JSON
  - [ ] Handle client disconnection gracefully
- [ ] Emit updates from agent execution
  - [ ] After each agent completes → send WebSocket update
  - [ ] Final result → status: "completed" + full result

#### Rate Limiting & Quota
- [ ] Create `/backend/src/middleware/rateLimiter.ts`
  - [ ] 100 req/min per user (free tier)
  - [ ] 1000 req/min per user (pro tier)
  - [ ] Return 429 Too Many Requests when exceeded
  - [ ] Include `X-RateLimit-*` headers
- [ ] Track quota usage
  - [ ] Store in Supabase: `commands.created_at`
  - [ ] Calculate monthly usage in GET /api/user/profile

#### Database Integration
- [ ] Create `/backend/src/db/queries.ts` (helper functions)
  - [ ] `insertCommand(user_id, content)` → command_id
  - [ ] `updateCommand(command_id, { status, result })`
  - [ ] `listCommands(user_id, limit, offset)` → [commands]
  - [ ] `getUser(user_id)` → user profile
- [ ] Create types: `/backend/src/types/db.ts`
  - [ ] User, Command, AgentExecution interfaces

### Deliverables
- [ ] Express server with OAuth + JWT auth working
- [ ] `/api/commands` POST/GET endpoints functional
- [ ] WebSocket real-time updates working
- [ ] Rate limiting enforced
- [ ] Database queries tested

### Success Criteria
- [ ] `npm run dev` (backend) starts on port 3001
- [ ] OAuth flow: Login → Google → Redirect → Dashboard works
- [ ] POST /api/commands returns command_id (201)
- [ ] WebSocket subscription receives updates
- [ ] Rate limiting triggers at 101st request

---

## Week 5-6: Agent System (Master + 4 Agents)

### Objectives
- Master Agent (orchestrator)
- File Agent (read, write, list)
- Terminal Agent (shell commands)
- Search Agent (semantic search)
- Tool executor framework

### Tasks

#### Master Agent
- [ ] Create `/backend/src/agents/master.ts`
  - [ ] Initialize Gemini API client
  - [ ] System prompt (intent parsing, agent routing, synthesis)
  - [ ] `async process(userCommand, context)` method
    - [ ] Parse intent: "what does user want?"
    - [ ] Identify agents: "which agents to use?"
    - [ ] Extract parameters: "what details does each agent need?"
    - [ ] Execute agents in parallel (where possible)
    - [ ] Synthesize results: "craft user-friendly response"
    - [ ] Return `{ agents_used, results, summary }`
- [ ] Error handling: if agent fails, continue with others
- [ ] Logging: trace each step for debugging

#### File Agent
- [ ] Create `/backend/src/agents/file.ts`
  - [ ] `async execute(command, params)` method
  - [ ] Handlers:
    - [ ] `readFile(path)` → file content (max 10MB)
    - [ ] `writeFile(path, content)` → success/error
    - [ ] `listDirectory(path)` → [files]
    - [ ] `createDirectory(path)` → success/error
    - [ ] `deleteFile(path)` → with confirmation
  - [ ] Security:
    - [ ] Validate path (no `../`, no `/etc`, no `/sys`)
    - [ ] Only user's own files (`/home/{user_id}/`)
    - [ ] Timeout: 5 seconds max
    - [ ] Max file size: 10MB
- [ ] Error handling: file not found, permission denied, etc.

#### Terminal Agent
- [ ] Create `/backend/src/agents/terminal.ts`
  - [ ] `async execute(command, params)` method
  - [ ] Execute shell command safely
    - [ ] Use `child_process.exec()` or safer alternative
    - [ ] Timeout: 30 seconds
    - [ ] Resource limits: 512MB memory, 4 CPU cores
  - [ ] Safety constraints:
    - [ ] Whitelist commands (no `sudo`, `rm -rf /`, `passwd`, etc.)
    - [ ] No process spawning (shell injection protection)
    - [ ] Capture stdout + stderr
    - [ ] Return `{ success, output, error }`
- [ ] Support common commands:
    - [ ] `npm install`, `npm run`, `npm test`
    - [ ] `git clone`, `git add`, `git commit`
    - [ ] `ls`, `cd`, `mkdir`, `cat`, `grep`

#### Search Agent
- [ ] Create `/backend/src/agents/search.ts`
  - [ ] `async execute(command, params)` method
  - [ ] Full-text search (Supabase)
    - [ ] Query `commands.input` table
    - [ ] Return matching commands with context
  - [ ] Semantic search (pgvector, Phase 2+)
    - [ ] Query embeddings for similar commands
  - [ ] File search (Phase 2+)
    - [ ] Query indexed files
    - [ ] Return top 10 results

#### Tool Registry & Executor
- [ ] Create `/backend/src/tools/registry.ts`
  - [ ] Map agent type → agent instance
  - [ ] Register tools: file, terminal, search, browser (later), coder (later)
  - [ ] Validate tool availability
- [ ] Create `/backend/src/tools/executor.ts`
  - [ ] `async executeTool(agent_type, tool_name, input)` method
  - [ ] Error handling + retries
  - [ ] Logging + tracing

#### Integration with Command API
- [ ] Modify `/backend/src/api/commands.ts` POST handler
  - [ ] When command received: call `masterAgent.process()`
  - [ ] Insert into `agent_executions` table (one per agent)
  - [ ] Update command status → "completed" or "failed"
  - [ ] Emit WebSocket updates as each agent completes

### Deliverables
- [ ] Master Agent orchestrating agents
- [ ] File, Terminal, Search agents functional
- [ ] Tool executor framework
- [ ] Integration with command API
- [ ] Execution traces in database

### Success Criteria
- [ ] "List files in ~/projects" → File Agent returns files
- [ ] "Run npm install" → Terminal Agent executes command
- [ ] "Search my past commands for 'database'" → Search Agent returns matches
- [ ] All agents complete within 30 seconds
- [ ] Agent execution traces visible in command details

---

## Week 7-8: Frontend & Launch Polish

### Objectives
- React dashboard (Next.js)
- Real-time streaming UI
- Error handling & user feedback
- Testing & documentation
- Public launch

### Tasks

#### Frontend Dashboard
- [ ] Create `/frontend/app/page.tsx`
  - [ ] Layout: Sidebar (history) + Main (input + response)
  - [ ] Check authentication on mount
  - [ ] Fetch command history (GET /api/commands)
- [ ] Create `/frontend/components/CommandInput.tsx`
  - [ ] Textarea for command input
  - [ ] "Send" button
  - [ ] Disabled while executing
  - [ ] Placeholder text with examples
- [ ] Create `/frontend/components/ResponseStream.tsx`
  - [ ] Display status badge (pending, running, completed, failed)
  - [ ] Loading spinner while executing
  - [ ] Results displayed as JSON (formatted, copyable)
  - [ ] Error message if failed
- [ ] Create `/frontend/components/CommandHistory.tsx`
  - [ ] List of recent commands
  - [ ] Status indicator (✅ / ❌)
  - [ ] Click to view details
  - [ ] "Clear history" button

#### Real-Time WebSocket Connection
- [ ] Create `/frontend/hooks/useWebSocket.ts`
  - [ ] Connect to `WS /ws/commands/:id`
  - [ ] Listen for updates
  - [ ] Update component state in real-time
  - [ ] Handle connection errors gracefully
- [ ] Integrate with ResponseStream
  - [ ] Stream updates as they arrive
  - [ ] Show which agents are running
  - [ ] Execution time for each agent

#### Authentication UI
- [ ] Create `/frontend/app/auth/page.tsx`
  - [ ] "Sign in with Google" button
  - [ ] Google OAuth redirect flow
  - [ ] Save JWT token to localStorage
  - [ ] Redirect to dashboard on success
- [ ] Create auth middleware
  - [ ] Redirect to /auth if no token
  - [ ] Check token validity on app load

#### Settings & User Profile
- [ ] Create `/frontend/app/settings/page.tsx`
  - [ ] Display user info (name, email, tier)
  - [ ] API key management (display last 4 chars)
  - [ ] Theme toggle (light/dark)
  - [ ] Language selection (English, Hindi)
  - [ ] Logout button

#### Error Handling
- [ ] Display user-friendly error messages
- [ ] Show execution traces on error (for debugging)
- [ ] Retry button for failed commands
- [ ] Rate limit warning (approaching quota)

#### Styling & UX
- [ ] Use Tailwind CSS for styling
- [ ] Responsive design (mobile-friendly)
- [ ] Dark mode support
- [ ] Loading states (spinners, skeletons)
- [ ] Animations (smooth transitions)

#### Testing
- [ ] Unit tests for utility functions (50%+ coverage)
  - [ ] API client functions
  - [ ] Validators (Zod schemas)
  - [ ] Utility helpers
- [ ] Integration tests (25%+ coverage)
  - [ ] OAuth flow
  - [ ] Create & list commands
  - [ ] WebSocket real-time updates
- [ ] E2E tests (basic smoke test)
  - [ ] Login → Create command → View result → Logout
  - [ ] Run: `npm run test`
  - [ ] Generate coverage report

#### Documentation
- [ ] API documentation (Swagger/OpenAPI)
  - [ ] All endpoints documented
  - [ ] Request/response examples
  - [ ] Error codes
  - [ ] Deploy to `/docs` route
- [ ] Setup guide
  - [ ] Local development (docker-compose up)
  - [ ] Vercel deployment
  - [ ] Railway deployment
  - [ ] Environment variables reference
- [ ] Contributing guidelines
  - [ ] Code style (ESLint + Prettier)
  - [ ] Branch naming convention
  - [ ] Commit message format
  - [ ] PR process
- [ ] User guide (Getting Started)
  - [ ] How to sign up
  - [ ] First command example
  - [ ] Understanding agents
  - [ ] FAQ

#### Pre-Launch Checklist
- [ ] [ ] Security review (no hardcoded secrets)
- [ ] [ ] Performance audit (Lighthouse >80)
- [ ] [ ] Accessibility review (WCAG 2.1 AA)
- [ ] [ ] Load testing (100 concurrent users)
- [ ] [ ] Smoke tests pass
- [ ] [ ] All tests passing (>80% coverage)
- [ ] [ ] Documentation complete
- [ ] [ ] README finalized
- [ ] [ ] MIT License in place
- [ ] [ ] CONTRIBUTING.md reviewed
- [ ] [ ] Code reviewed by peer

#### Launch
- [ ] Deploy to production
  - [ ] Frontend: Vercel
  - [ ] Backend: Railway
  - [ ] Database: Supabase
- [ ] Verify all services healthy
  - [ ] Frontend loads
  - [ ] OAuth works
  - [ ] Commands execute
  - [ ] WebSocket updates in real-time
- [ ] Monitor for errors (Sentry)
- [ ] Announce on Twitter, GitHub, LinkedIn
- [ ] Add to ProductHunt (optional)

### Deliverables
- [ ] Live MVP at https://signhify-ai.vercel.app
- [ ] Fully functional dashboard
- [ ] Real-time WebSocket updates
- [ ] Complete API documentation
- [ ] Setup & user guides
- [ ] >80% test coverage
- [ ] Public GitHub repository

### Success Criteria
- [ ] MVP stable for 7 days (no critical crashes)
- [ ] 50+ sign-ups in first week
- [ ] 10+ users completing 5+ commands each
- [ ] <2s average response time
- [ ] 95%+ command success rate
- [ ] 500+ GitHub stars (within 2 months)

---

## Phase 1 Success Metrics & KPIs

| KPI | Target | Measurement |
| --- | --- | --- |
| MVP Stability | 99%+ uptime | UptimeRobot monitoring |
| User Acquisition | 50+ sign-ups/week | Google Analytics |
| Daily Active Users | 10+ | Unique IP visits |
| Command Success Rate | 95%+ | (successful / total) |
| Avg Response Time | <2s | Sentry APM |
| Test Coverage | >80% | Jest/Vitest reports |
| GitHub Stars | 100+ (by end of week 8) | GitHub insights |
| GitHub Forks | 10+ | GitHub insights |

---

## Critical Blockers & Contingency Plans

| Blocker | Impact | Contingency |
| --- | --- | --- |
| API quota exceeded (Gemini) | Agents can't execute | Fallback to Groq API, rate limit users earlier |
| Database down | Commands can't save | Supabase auto-failover, manual backup restore |
| OAuth integration fails | Users can't login | Use Supabase Auth (built-in), faster to implement |
| WebSocket connections unstable | Real-time updates unreliable | Switch to polling (slower but more stable) |
| Deployment pipeline breaks | Can't ship updates | Manual deployment script, GitHub Actions debugging |

---

## Week-by-Week Standup Template

### Monday (Week Start)
- [ ] Review previous week deliverables
- [ ] Confirm current week scope
- [ ] Identify blockers early
- [ ] Adjust timeline if needed

### Wednesday (Mid-week Check)
- [ ] Progress review
- [ ] Any blockers emerging?
- [ ] Course correction if needed
- [ ] Team sync (15 min)

### Friday (Week End)
- [ ] Demo completed features
- [ ] Document learnings
- [ ] Plan next week
- [ ] Update GitHub Project Board

---

## Notes for Piyush

This is **your** timeline. Adapt it based on:
- Your team size (solo → need to prioritize)
- Your bandwidth (part-time vs. full-time)
- External dependencies (API availability, service outages)
- Market feedback (real users might want different features first)

**Golden rule:** Ship something every week, even if small. Weekly releases build momentum.

Good luck! 🚀
