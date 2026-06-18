# Signhify AI — Comprehensive Codebase Analysis & Implementation Plan

> **Project**: Signhify AI — Voice-first, multi-agent AI productivity platform  
> **Creator**: **Piyush Raj Singh** (Solo Creator / Godfather)  
> **Date**: June 18, 2026  
> **Scope**: Full codebase audit → Security hardening → Performance optimization → Production deployment

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Deep-Dive](#2-architecture-deep-dive)
3. [Security Vulnerabilities](#3-security-vulnerabilities-critical)
4. [Performance Bottlenecks](#4-performance-bottlenecks)
5. [Technical Debt](#5-technical-debt)
6. [Proposed Changes — 5-Phase Plan](#6-proposed-changes--5-phase-plan)
7. [Deployment Strategy](#7-deployment-strategy)
8. [Verification Plan](#8-verification-plan)

---

## 1. Executive Summary

Signhify AI is a **monorepo-based, multi-agent AI platform** built with React + Vite (frontend), Express + MongoDB (backend), and a modular agent system supporting 10+ LLM providers with automatic free-first fallback. The codebase demonstrates sophisticated architectural patterns (BYOK, circuit breaker, event streaming, gateway adapters), but has **critical security issues** and several performance/debt areas that must be resolved before production deployment.

### Key Findings at a Glance

| Category                   | Severity     | Count |
| -------------------------- | ------------ | ----- |
| 🔴 Critical Security       | **CRITICAL** | 5     |
| 🟠 Security Concerns       | HIGH         | 4     |
| 🟡 Performance Bottlenecks | MEDIUM       | 6     |
| 🔵 Technical Debt          | LOW-MEDIUM   | 8     |

---

## 2. Architecture Deep-Dive

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (apps/web)"
        UI["React + Vite + Tailwind v4"]
        Zustand["Zustand Stores (8)"]
        KeyVault["KeyVault (localStorage)"]
        R3F["React Three Fiber (3D UI)"]
    end

    subgraph "Backend (server/)"
        Express["Express.js + Helmet"]
        Auth["JWT Auth + Refresh Tokens"]
        Routes["13 Route Modules"]
        SSE["SSE Streaming"]
        Scheduler["Cron Scheduler"]
        MemMgr["Memory Manager"]
        SkillReg["Skill Registry"]
        GW["Gateway Adapters"]
    end

    subgraph "Packages"
        Types["@signhify/types"]
        Memory["@signhify/memory"]
        Agents["@signhify/agents"]
    end

    subgraph "Infrastructure"
        Mongo["MongoDB 7"]
        Redis["Redis 7 (optional)"]
        Telegram["Telegram Bot"]
        Discord["Discord Bot"]
    end

    UI --> SSE
    UI --> Auth
    KeyVault -->|"BYOK Headers"| Express
    Express --> Routes
    Routes --> Agents
    Agents --> Types
    MemMgr --> Memory
    MemMgr --> Mongo
    MemMgr --> Redis
    Scheduler --> Agents
    GW --> Telegram
    GW --> Discord
```

### 2.2 Build Dependency Graph

```
@signhify/types (leaf)
    ↓
@signhify/memory (depends on types)
    ↓
@signhify/agents (depends on types, memory)
    ↓
@signhify/server (depends on agents, memory, types)
    ↓
@signhify/web (standalone — does NOT extend tsconfig.base.json)
```

### 2.3 Multi-Agent Architecture

```mermaid
flowchart LR
    User["User Message"] --> Nexus["Nexus Router"]
    Nexus -->|"classify"| Scribe["Scribe (Writing)"]
    Nexus -->|"classify"| Scout["Scout (Research)"]
    Nexus -->|"classify"| Forge["Forge (Code)"]
    Nexus -->|"classify"| Vault["Vault (Memory)"]
    Nexus -->|"classify"| Herald["Herald (Comms)"]
    Nexus -->|"classify"| Vision["Vision (Image)"]
    Nexus -->|"fallback"| General["General (Chat)"]

    subgraph "Provider Layer"
        PM["ProviderManager"]
        CB["Circuit Breaker"]
        FM["Free Model Registry"]
    end

    Scribe --> PM
    Scout --> PM
    Forge --> PM
    General --> PM
    PM --> CB
    PM --> FM
```

### 2.4 Data Flow — Chat Request

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Nexus
    participant Agent
    participant Memory
    participant LLM
    participant DB

    Client->>Server: POST /api/agents/chat (SSE)
    Note over Server: Auth + BYOK + Rate Limit middleware
    Server->>Nexus: classifyIntent(message)
    Nexus->>LLM: Gemini Flash classification
    Nexus-->>Server: agentType
    Server->>Memory: getRelevantContext(userId, message)
    Memory->>DB: Search episodes + facts (embeddings)
    Memory-->>Server: enrichedContext
    Server->>Agent: run[Agent](message, keys, onToken)
    Agent->>LLM: Stream via ProviderManager (free-first)
    LLM-->>Agent: Token stream
    Agent-->>Server: Tokens via callback
    Server-->>Client: SSE events (status, agent, token, done)
    Server->>DB: Store episode + update profile
    Server->>DB: Store thread message
```

### 2.5 Module Relationships

| Module             | Depends On            | Depended By            | Files         | Purpose                                 |
| ------------------ | --------------------- | ---------------------- | ------------- | --------------------------------------- |
| `@signhify/types`  | —                     | agents, memory, server | 1 (313 lines) | Shared TypeScript interfaces            |
| `@signhify/memory` | types                 | agents, server         | 3 files       | In-memory store + toy embeddings        |
| `@signhify/agents` | types, memory         | server                 | 16+ files     | 7 agents, 10 adapters, provider manager |
| `server/`          | agents, memory, types | web (via API)          | 30+ files     | Express API, MongoDB, Redis, scheduling |
| `apps/web`         | — (API via fetch)     | —                      | 25+ files     | React SPA, Zustand, 3D UI               |

---

## 3. Security Vulnerabilities (CRITICAL)

> [!CAUTION]
> **The following issues must be resolved IMMEDIATELY before any public deployment.**

### 🔴 SEC-1: Plaintext API Keys Committed to Repository

**File**: `apikeys.md`

```
openrouter:- sk-or-v1-57fc4624...
groq:- gsk_dIa01umiz...
gemini:- AQ.Ab8RN6...
cerebras:- csk-x46dfn...
mistral:- vb0TkktQx...
```

**Impact**: All 9 API keys for OpenRouter, Groq, Gemini, xAI, Cerebras, Mistral, Cohere, NVIDIA NIM, and OpenCode are in plaintext. Even though `apikeys.md` is in `.gitignore`, if it was **ever committed**, the keys persist in git history.

**Remediation**:

1. Rotate ALL exposed keys immediately
2. Run `git filter-branch` or `git-filter-repo` to purge from history
3. Delete the file and never store keys in files

### 🔴 SEC-2: MongoDB Atlas Production Credentials Exposed

**File**: `atlas-credentials.env`

```
MONGODB_USERNAME="rajpiyush092_db_user"
MONGODB_PASSWORD="uoQ7att2oqsDSf46"
MONGODB_URI="mongodb+srv://rajpiyush092_db_user:uoQ7att2oqsDSf46@cluster0.xfzax7j.mongodb.net"
```

**And** `.env.render`:

```
MONGODB_URI=mongodb+srv://rajpiyush092_db_user:uoQ7att2oqsDSf46@cluster0.xfzax7j.mongodb.net/signhify
JWT_SECRET=sg-ini6xr9k2p4mz8wq7v3b1j5t0yfldcna
```

**Impact**: Production MongoDB Atlas credentials AND the production JWT signing secret are in plaintext files. An attacker with repo access can read/write/delete all user data and forge authentication tokens.

**Remediation**:

1. Rotate MongoDB password immediately in Atlas console
2. Rotate JWT_SECRET
3. Purge these files from git history
4. Store production secrets ONLY in Render's environment variable dashboard

### 🔴 SEC-3: Hardcoded JWT Fallback Secret

**File**: `server/src/middleware/auth.ts`

```typescript
export const JWT_SECRET =
  process.env.JWT_SECRET ?? "signhify-dev-secret-change-in-prod";
```

**And** `server/src/routes/auth.ts`:

```typescript
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "signhify-dev-refresh-secret";
```

**Impact**: If env vars aren't set, the server runs with a guessable, hardcoded secret. Anyone can forge JWTs.

**Remediation**: Fail fast if `JWT_SECRET` or `JWT_REFRESH_SECRET` is not set in production. The env validator already checks `JWT_SECRET`, but `JWT_REFRESH_SECRET` bypasses validation entirely.

### 🔴 SEC-4: Weak Client-Side Key "Encryption"

**File**: `apps/web/src/lib/keyVault.ts`

```typescript
const SALT = "signhify-salt-2026";
function obfuscate(str: string): string {
  return btoa(
    str
      .split("")
      .map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)),
      )
      .join(""),
  );
}
```

**Impact**: XOR with a hardcoded salt and base64 encoding is **NOT encryption** — it's trivially reversible obfuscation. Any user's API keys stored in localStorage can be decoded by any script running in the browser (XSS = full key theft).

**Remediation**:

1. Use the Web Crypto API (`crypto.subtle`) with AES-GCM and a user-derived key
2. Or better: store keys server-side encrypted at rest, never in localStorage
3. At minimum, document the risk clearly for BYOK users

### 🔴 SEC-5: Content Security Policy Disabled

**File**: `server/src/index.ts`

```typescript
app.use(helmet({ contentSecurityPolicy: false }));
```

**Impact**: No CSP means the app is wide open to XSS attacks. Combined with SEC-4 (API keys in localStorage), this creates a path to full API key theft.

**Remediation**: Configure a proper CSP that allows only trusted sources.

---

### 🟠 SEC-6: No Input Sanitization on User Messages to LLMs

**File**: `server/src/routes/agents.ts`

User messages are passed directly to LLMs without sanitization. This enables prompt injection attacks where malicious users could manipulate agent behavior, extract system prompts, or generate harmful content.

### 🟠 SEC-7: API Keys Sent in HTTP Headers (BYOK)

**File**: `server/src/middleware/byok.ts`

All 13 API keys are sent as custom HTTP headers on every request. While HTTPS encrypts these in transit, they may appear in server access logs, reverse proxy logs, and CDN logs.

### 🟠 SEC-8: No CSRF Protection

The refresh token is stored in an `httpOnly` cookie with `sameSite: "strict"`, which provides some CSRF protection. However, there's no CSRF token validation, and the `secure` flag means the cookie won't work over HTTP in development.

### 🟠 SEC-9: Missing Rate Limiting on Auth Endpoints

The `/api/auth/login` and `/api/auth/register` routes have no rate limiting, enabling brute-force attacks and account enumeration.

---

## 4. Performance Bottlenecks

### ⚡ PERF-1: Toy Embedding Model (Hash-Based)

**File**: `packages/memory/src/embeddings.ts`

```typescript
export function computeEmbedding(
  text: string,
  dimensions = 128,
): EmbeddingResult {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(dimensions).fill(0);
  for (const word of words) {
    const hash = simpleHash(word);
    for (let i = 0; i < dimensions; i++) {
      vector[i] += Math.sin(hash * (i + 1));
    }
  }
  return { vector: normalize(vector), dimension: dimensions };
}
```

**Impact**: This is a deterministic hash-based pseudo-embedding. It has NO semantic understanding — "happy" and "joyful" produce completely different vectors. Memory search quality is severely degraded.

**Recommendation**: Replace with a real embedding model (e.g., `text-embedding-3-small` via OpenAI, or `nomic-embed-text` for free local inference).

### ⚡ PERF-2: Brute-Force Vector Search (O(n))

**File**: `server/src/services/memory-manager.ts`

```typescript
const episodes = await MemoryEpisode.find({ userId })
  .sort({ timestamp: -1 })
  .limit(200);
const scored = episodes
  .filter((e) => e.embedding && e.embedding.length > 0)
  .map((e) => ({
    ...e.toObject(),
    score: cosineSimilarity(queryVec, e.embedding!),
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, topK);
```

**Impact**: Loads up to 200 episodes from MongoDB, transfers all embedding vectors, then computes cosine similarity in JS. This is O(n) per search and gets worse as users accumulate data.

**Recommendation**: Use MongoDB Atlas Vector Search or a dedicated vector store (Pinecone, Qdrant, Weaviate).

### ⚡ PERF-3: In-Memory Store Data Loss

**File**: `packages/memory/src/store.ts`

The `globalMemoryStore` is a plain `Map<string, Map<string, MemoryEntry>>`. All Vault data stored here is **lost on every server restart**. The dual storage (in-memory + MongoDB via Notes) creates inconsistency.

### ⚡ PERF-4: Redis KEYS Pattern Scanning

**File**: `server/src/lib/redis.ts`

```typescript
const keys = await client.keys(pattern);
```

**Impact**: `KEYS` is an O(n) operation that blocks the entire Redis server. In production with many users, this degrades Redis performance.

**Recommendation**: Use `SCAN` with cursor-based iteration, or maintain explicit key sets.

### ⚡ PERF-5: No Pagination on List Endpoints

Memory, skills, episodes, and facts endpoints return **all** records without pagination. As data grows, this causes increasing response times and memory pressure.

### ⚡ PERF-6: Massive Single Route Handler (380 lines)

**File**: `server/src/routes/agents.ts` — 380 lines in a single POST handler

The `/api/agents/chat` handler does classification, memory retrieval, agent execution, thread storage, skill detection, AND profile extraction — all in one function. This is unmaintainable and impossible to test individually.

---

## 5. Technical Debt

### 📋 DEBT-1: Duplicate Type Definitions

`ApiKeys` and `ModelSpec` types are defined identically in BOTH:

- `packages/agents/src/shared.ts`
- `packages/agents/src/provider-manager.ts`

And `modelConfigs` is duplicated with slightly different keys (shared.ts uses string keys, provider-manager.ts uses `ProviderId`).

### 📋 DEBT-2: Legacy `createLLM` Alongside `ProviderManager`

Two parallel systems exist for LLM routing:

1. `createLLM()` in `shared.ts` → legacy `FallbackModel` class
2. `ProviderManager` in `provider-manager.ts` → newer adapter-based system

The agent route handler falls back from ProviderManager to `createLLM`, maintaining both code paths.

### 📋 DEBT-3: `loadFromStorage` Doesn't Decode User Data

**File**: `apps/web/src/stores/authStore.ts`

```typescript
loadFromStorage: () => {
  const token = localStorage.getItem("signhify_token");
  if (token) {
    set({ token, isAuthenticated: true });
    // ⚠️ user object is NOT restored — it's null!
  }
};
```

After a page refresh, the user appears authenticated but `user` is `null`, which will cause crashes on any component that reads `user.displayName` or `user.email`.

### 📋 DEBT-4: Stale Model References

The codebase references models that may be deprecated or renamed:

- `deepseek-coder-v2` (Groq)
- `claude-3-5-haiku-20241022` / `claude-3-5-sonnet-20241022` (old date-stamped models)
- Various Llama 3.1 models (Llama 3.3 is current)

### 📋 DEBT-5: No Error Boundary on SSE Streams

If the SSE connection drops mid-stream, the client has no reconnection logic. The `useAgentStream` hook will silently leave `isStreaming: true` forever.

### 📋 DEBT-6: Missing `JWT_REFRESH_SECRET` in Env Validation

The Zod schema in `server/src/lib/env.ts` validates `JWT_SECRET` but does NOT validate `JWT_REFRESH_SECRET`. This means the refresh token always uses the hardcoded fallback.

### 📋 DEBT-7: Port Mismatch (documented in AGENTS.md)

Web Vite proxy targets `http://localhost:5173` but server `.env` sets `PORT=4000`. The AGENTS.md warns about this but it remains unfixed.

### 📋 DEBT-8: Incomplete Test Coverage

Only basic smoke tests exist. No integration tests for the agent pipeline, no tests for the BYOK middleware, no tests for the memory manager, and no tests for the scheduler.

---

## 6. Proposed Changes — 5-Phase Plan

### Phase 1: 🔴 Critical Security Hardening (IMMEDIATE)

> [!CAUTION]
> **This phase MUST be completed before any deployment.** Exposed credentials pose an active risk.

#### [MODIFY] `.gitignore`

- Add patterns for `*.env`, `*credentials*`, `apikeys*`
- Ensure no credential files can ever be committed

#### [DELETE] `apikeys.md`

- Remove from repository entirely
- Rotate all 9 exposed API keys at their respective providers

#### [DELETE] `atlas-credentials.env`

- Remove from repository
- Rotate MongoDB Atlas password
- Purge from git history with `git filter-repo`

#### [MODIFY] `.env.render`

- Remove production secrets from this file
- Replace with placeholder instructions pointing to Render dashboard

#### [MODIFY] `server/src/middleware/auth.ts`

- Remove hardcoded JWT fallback secret
- Fail fast if `JWT_SECRET` is not set

#### [MODIFY] `server/src/routes/auth.ts`

- Add `JWT_REFRESH_SECRET` to env validation
- Remove hardcoded refresh secret fallback
- Add rate limiting to login/register endpoints

#### [MODIFY] `server/src/lib/env.ts`

- Add `JWT_REFRESH_SECRET` to Zod schema as required
- Add validation for OTEL env vars

#### [MODIFY] `server/src/index.ts`

- Configure proper Content Security Policy
- Add CORS origin validation

---

### Phase 2: 🟠 Architecture Improvements

#### [MODIFY] `server/src/routes/agents.ts`

- Extract the 380-line handler into a `ChatOrchestrator` service class
- Separate concerns: classification → context → execution → storage → profiling
- Add proper error handling per stage

#### [MODIFY] `packages/agents/src/shared.ts`

- Remove duplicate `ApiKeys` and `modelConfigs`
- Import from `provider-manager.ts` or `@signhify/types`
- Deprecate `createLLM` in favor of `ProviderManager`

#### [MODIFY] `apps/web/src/lib/keyVault.ts`

- Replace XOR obfuscation with Web Crypto API (AES-GCM)
- Use a user-derived key (e.g., hashed password or session-bound key)

#### [MODIFY] `apps/web/src/stores/authStore.ts`

- Restore user data on `loadFromStorage` via `/api/auth/user` call
- Add token refresh logic on app startup

#### [NEW] `server/src/services/chat-orchestrator.ts`

- Extract chat pipeline from route handler
- Implement proper middleware chain pattern

---

### Phase 3: 🟡 Performance Optimization

#### [MODIFY] `packages/memory/src/embeddings.ts`

- Replace hash-based pseudo-embeddings with real model
- Add support for OpenAI `text-embedding-3-small` (via BYOK key)
- Fallback to TF-IDF or BM25 for users without embedding API key

#### [MODIFY] `server/src/services/memory-manager.ts`

- Add pagination to all list methods
- Implement cursor-based pagination for episode/fact search
- Consider MongoDB Atlas Vector Search for production

#### [MODIFY] `server/src/lib/redis.ts`

- Replace `client.keys(pattern)` with `SCAN` command
- Add connection pooling configuration
- Add key prefix namespace

#### [MODIFY] `packages/memory/src/store.ts`

- Either remove `globalMemoryStore` (use only MongoDB) or add periodic persistence
- Document that this is a volatile cache, not persistent storage

#### [MODIFY] `apps/web/src/hooks/useAgentStream.ts`

- Add SSE reconnection logic with exponential backoff
- Add timeout handling
- Clean up `isStreaming` state on connection errors

---

### Phase 4: 🔵 Quality & Testing

#### [NEW] `server/src/__tests__/agents.integration.test.ts`

- Test the full chat pipeline with mocked LLM responses
- Test each agent type routing

#### [NEW] `server/src/__tests__/auth.test.ts`

- Test registration, login, refresh, logout flows
- Test rate limiting on auth endpoints

#### [NEW] `server/src/__tests__/memory.test.ts`

- Test episode storage and retrieval
- Test fact CRUD with embedding similarity

#### [MODIFY] `apps/web/src/__tests__/` (existing)

- Add tests for authStore token refresh
- Add tests for KeyVault encryption

#### [NEW] `server/src/__tests__/middleware.test.ts`

- Test BYOK header extraction
- Test rate limiter behavior
- Test auth middleware edge cases

---

### Phase 5: 🚀 Production Deployment & Open-Source Launch

#### [MODIFY] `README.md`

- Complete overhaul with professional open-source README
- Add prominent creator credits for **Piyush Raj Singh**
- Add badges (CI, License, Version)
- Add architecture diagrams
- Add deployment guides
- Add contributor guidelines

#### [NEW] `CREDITS.md`

- Dedicated credits page for **Piyush Raj Singh — Solo Creator & Godfather**
- Links to social profiles:
  - Instagram: https://www.instagram.com/piyushrajsingh.golu
  - LinkedIn: https://LinkedIn.com/in/piyushraj-singh
  - AI Engineering Studio: https://Signhify.lovable.app

#### [MODIFY] `LICENSE`

- Update copyright to "Copyright (c) 2026 Piyush Raj Singh"

#### [NEW] `CONTRIBUTING.md`

- Contribution guidelines for the open-source community
- Code of conduct
- Development setup instructions

#### [NEW] `SECURITY.md`

- Responsible disclosure policy
- Security contact information

#### [MODIFY] `render.yaml`

- Add Redis service
- Add health check configuration
- Add auto-scaling rules

#### [MODIFY] `.github/workflows/ci.yml`

- Add secret scanning step
- Add SAST (static analysis) step
- Add dependency vulnerability scanning

---

## 7. Deployment Strategy

### Architecture for Production

```mermaid
graph LR
    subgraph "Vercel (Frontend)"
        Web["apps/web<br/>React SPA"]
    end

    subgraph "Render (Backend)"
        Server["server/<br/>Express API"]
    end

    subgraph "MongoDB Atlas"
        DB["Cluster0<br/>M0 Free Tier"]
    end

    subgraph "Upstash"
        Cache["Redis<br/>Serverless"]
    end

    Web -->|"HTTPS API"| Server
    Server --> DB
    Server --> Cache
```

### Deployment Steps

1. **Secrets**: Move ALL secrets to Render environment variables (never in files)
2. **Frontend**: Deploy `apps/web` to Vercel with auto-deploy from `main`
3. **Backend**: Deploy `server/` to Render via Docker (existing `render.yaml`)
4. **Database**: MongoDB Atlas M0 (free) → M10 when scaling
5. **Cache**: Upstash Redis (serverless, free tier available)
6. **DNS**: Configure custom domain
7. **CI/CD**: GitHub Actions → quality gate → auto-deploy

---

## 8. Verification Plan

### Automated Tests

```bash
# After each phase, run the full quality gate:
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

### Security Verification

```bash
# Verify no secrets in git history
git log --all --oneline -- apikeys.md atlas-credentials.env .env.render

# Scan for hardcoded secrets
grep -rn "sk-or-v1\|gsk_\|AIza\|csk-\|mongodb+srv://" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.env"
```

### Manual Verification

- [ ] Rotate all exposed API keys and verify old keys are rejected
- [ ] Rotate MongoDB password and verify application connects with new creds
- [ ] Test JWT authentication with new secrets
- [ ] Verify CSP headers in browser DevTools
- [ ] Load test rate limiter (100 req/min default)
- [ ] Verify SSE streaming works end-to-end after refactor
- [ ] Test Redis graceful degradation (app works without Redis)
- [ ] Verify Docker build succeeds with new changes
- [ ] Deploy to staging environment and test all user flows

---

## User Review Required

> [!IMPORTANT]
> **Credential Rotation Required**: Before proceeding, you must immediately:
>
> 1. Rotate your MongoDB Atlas password at https://cloud.mongodb.com
> 2. Rotate ALL API keys listed in `apikeys.md` at their respective providers
> 3. Generate a new JWT_SECRET (at least 64 chars, cryptographically random)
> 4. Decide: do you want me to purge these files from git history? (This rewrites history and requires force-push)

> [!WARNING]
> **BYOK Key Storage**: The current client-side key storage (XOR + base64) provides virtually no security. Should we:
>
> - **(A)** Upgrade to Web Crypto API (AES-GCM) — still localStorage, but proper encryption
> - **(B)** Move to server-side encrypted storage — more secure but changes the architecture
> - **(C)** Keep current approach but add clear security warnings in the UI

## Open Questions

> [!IMPORTANT]
>
> 1. **Embedding Model**: Should we use OpenAI's `text-embedding-3-small` (requires API key), a free local model via ONNX, or keep the current hash-based approach with a "good enough" disclaimer?
> 2. **Vector Search**: For production, should we use MongoDB Atlas Vector Search (keeps everything in Mongo) or a dedicated vector DB like Qdrant/Pinecone?
> 3. **Deployment Timeline**: Do you want to proceed with all 5 phases sequentially, or prioritize Phase 1 (security) and Phase 5 (deployment) for immediate launch, deferring Phases 2-4?
> 4. **Custom Domain**: Do you have a domain name ready (e.g., `signhify.ai`), or should we use the default Vercel/Render subdomains?
> 5. **Git History Rewrite**: Purging credentials from git history requires `git filter-repo` and a force-push. This will break any existing forks/clones. Is this acceptable?
