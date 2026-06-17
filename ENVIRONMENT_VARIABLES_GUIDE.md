# ⚙️ Environment Variables Configuration Guide

Complete guide for setting up environment variables for Signhify AI.

---

## Table of Contents

1. [Frontend (.env.local)](#frontend-envlocal)
2. [Backend (.env)](#backend-env)
3. [GitHub Secrets](#github-secrets)
4. [Vercel Deployment](#vercel-deployment)
5. [Railway Deployment](#railway-deployment)
6. [Supabase Setup](#supabase-setup)
7. [API Keys Guide](#api-keys-guide)
8. [Troubleshooting](#troubleshooting)

---

## Frontend (.env.local)

Create `frontend/.env.local` with the following variables:

```bash
# Next.js Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### Variable Explanations

**NODE_ENV**
- `development`: Enables hot reload, debug logs
- `production`: Optimizes bundle size, disables debug logs
- Default: `development`

**NEXT_PUBLIC_API_URL**
- Points to backend server
- Development: `http://localhost:3001`
- Production: `https://api.signhify-ai.vercel.app` (or your domain)
- **Important:** Must be accessible from browser

**NEXT_PUBLIC_GOOGLE_CLIENT_ID**
- Get from [Google Cloud Console](https://console.cloud.google.com)
- Must be a valid OAuth 2.0 client ID
- Include `.apps.googleusercontent.com` suffix

**NEXT_PUBLIC_GOOGLE_REDIRECT_URI**
- Must match exactly in Google Cloud Console
- Development: `http://localhost:3000/auth/callback`
- Production: `https://signhify-ai.vercel.app/auth/callback`

---

## Backend (.env)

Create `backend/.env` with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Redis (for Bull job queue)
REDIS_URL=redis://localhost:6379

# AI/LLM APIs
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxx
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxx
DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET_HERE

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Features (optional)
WHATSAPP_API_KEY=your_whatsapp_business_api_key
WHATSAPP_BUSINESS_ACCOUNT_ID=your_whatsapp_account_id
```

### Variable Explanations

**Database Variables (Supabase)**

Get these from Supabase Dashboard:
1. Go to Project Settings → API
2. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY` (keep secret!)

```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTQwMDAwMCwiZXhwIjoxOTk1MDAwMDAwfQ.sig
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM5NDAwMDAwLCJleHAiOjE5OTUwMDAwMDB9.sig
```

**Redis (for Job Queue)**

- Local development: `redis://localhost:6379`
- Railway: `redis://default:password@host:port`
- Vercel KV: `redis://default:token@host:port`

**AI/LLM APIs**

See [API Keys Guide](#api-keys-guide) section below.

**JWT_SECRET**

- Used to sign JWT tokens
- Must be cryptographically secure
- Generate: `openssl rand -base64 32`
- **Never share!**

```bash
# Generate strong JWT secret
openssl rand -base64 32
# Output: abcdefghijklmnopqrstuvwxyz1234567890ABCD+/==

# Use as JWT_SECRET
JWT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890ABCD+/==
```

**CORS_ORIGIN**

- Frontend URL
- Development: `http://localhost:3000`
- Production: `https://signhify-ai.vercel.app`

**LOG_LEVEL**

- `debug`: Most verbose (development)
- `info`: Standard (production)
- `warn`: Warnings only
- `error`: Errors only

---

## GitHub Secrets

Configure secrets in GitHub for CI/CD pipelines:

**Go to:** Repository → Settings → Secrets and Variables → Actions

Add the following secrets:

```
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=

RAILWAY_TOKEN=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

GEMINI_API_KEY=
GROQ_API_KEY=
TAVILY_API_KEY=

JWT_SECRET=

SLACK_WEBHOOK_URL=
```

**How to get:**

**Vercel Secrets:**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Account Settings → Tokens
3. Create new token → Copy
4. Project Settings → Get `ORG_ID` and `PROJECT_ID` from URL

**Railway Secrets:**
1. Go to [Railway Dashboard](https://railway.app)
2. Account Settings → API Tokens
3. Create token → Copy

**Supabase Secrets:**
- Get from Supabase Project Settings → API

**Slack Webhook (optional):**
1. Go to [Slack Apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Incoming Webhooks → Add New Webhook
4. Select channel → Copy URL

---

## Vercel Deployment

**Configure environment variables in Vercel:**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Settings → Environment Variables
4. Add variables:

```
NEXT_PUBLIC_API_URL=https://api.signhify-ai.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://signhify-ai.vercel.app/auth/callback

# Add for each environment (Production, Preview, Development)
```

**Vercel-specific:**
- `NEXT_PUBLIC_*`: Exposed to browser (visible in HTML)
- Everything else: Server-side only
- Different values for Production/Preview/Development possible

---

## Railway Deployment

**Configure environment variables in Railway:**

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on service (Node.js API)
4. Variables tab
5. Add all backend `.env` variables

```
NODE_ENV=production
PORT=5000  (Railway assigns dynamically, but set to 5000)

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

REDIS_URL=redis://... (auto-generated if Redis service added)

GEMINI_API_KEY=...
# ... etc
```

**Railway-specific:**
- `PORT` is auto-assigned, but set to 5000 as fallback
- `REDIS_URL` auto-generated if Redis service in same project

---

## Supabase Setup

**Create Supabase project:**

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Choose region (closest to India: Singapore or Mumbai)
4. Wait for provisioning

**Get credentials:**

1. Project Settings → API
2. Copy `Project URL` and keys
3. Store in `.env`

**Create database tables:**

1. SQL Editor → Create new query
2. Run migrations (see Phase 1 section)
3. Test connection:

```bash
psql "postgresql://postgres:PASSWORD@host:5432/postgres"
```

---

## API Keys Guide

### Google Gemini API

**Get API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy key (starts with `AIzaSy...`)
4. Add to `GEMINI_API_KEY`

**Free Tier:**
- 60 requests/minute
- 1 million tokens/month
- Sufficient for MVP

**Cost:**
- Beyond free tier: $0.075 per 1M tokens
- Estimate for 100 users: <$1/month

**Test:**
```bash
curl -X POST https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: AIzaSy..." \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

### Groq API

**Get API Key:**
1. Go to [Groq Console](https://console.groq.com)
2. API Keys → Create new
3. Copy key
4. Add to `GROQ_API_KEY`

**Free Tier:**
- 30 requests/minute
- No rate limits on tokens
- Ultra-fast inference (10ms/token)

**Cost:**
- Free tier sufficient
- Premium: $0.0005 per 1K tokens

**Test:**
```bash
curl --request POST \
  --url https://api.groq.com/openai/v1/chat/completions \
  --header "authorization: Bearer $GROQ_API_KEY" \
  --header "content-type: application/json" \
  --data '{"messages":[{"role":"user","content":"Hello"}],"model":"mixtral-8x7b-32768"}'
```

---

### Tavily Search API

**Get API Key:**
1. Go to [Tavily](https://app.tavily.com)
2. Sign up
3. Dashboard → API Keys → Create
4. Copy key
5. Add to `TAVILY_API_KEY`

**Free Tier:**
- 1,000 searches/month
- Sufficient for MVP

**Cost:**
- After free tier: $0.005/search

---

### Deepgram API (Optional, Phase 2)

**Get API Key:**
1. Go to [Deepgram](https://console.deepgram.com)
2. Sign up
3. Settings → API Keys → Create
4. Copy key
5. Add to `DEEPGRAM_API_KEY`

**Free Tier:**
- 23,000 minutes/month
- No credit card required

**Cost:**
- After free tier: $0.0043/minute

---

## Local Development (.env Template)

Copy to `backend/.env`:

```bash
# ============================================
# SIGNHIFY AI - LOCAL DEVELOPMENT ENVIRONMENT
# ============================================

# Server
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database (Local or Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Redis (Local)
REDIS_URL=redis://localhost:6379

# AI APIs (Get free tier keys)
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly_...
DEEPGRAM_API_KEY=your-key...

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Security (Generate with: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-here

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional Features
WHATSAPP_API_KEY=
WHATSAPP_BUSINESS_ACCOUNT_ID=
```

---

## Troubleshooting

### "Database connection refused"

**Problem:** Backend can't connect to Supabase

**Solution:**
1. Verify `SUPABASE_URL` is correct (ends in `.supabase.co`)
2. Verify `SUPABASE_ANON_KEY` is correct (long JWT string)
3. Check if Supabase project is active
4. Try connecting directly:
   ```bash
   psql $SUPABASE_URL
   ```

---

### "Invalid Google Client ID"

**Problem:** OAuth login fails with "Invalid Client ID"

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` matches exactly
2. Check it's added to Google Cloud Console Authorized Origins:
   - Development: `http://localhost:3000`
   - Production: `https://signhify-ai.vercel.app`
3. Check Redirect URI is correct:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://signhify-ai.vercel.app/auth/callback`

---

### "JWT Secret too short"

**Problem:** Server won't start - "JWT secret must be at least 32 characters"

**Solution:**
```bash
# Generate proper secret
openssl rand -base64 32

# Output example:
# abcdefghijklmnopqrstuvwxyz1234567890ABCD+/==

# Add to .env
JWT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890ABCD+/==
```

---

### "Redis connection failed"

**Problem:** Backend can't connect to Redis

**Solution:**
1. Check if Redis is running locally:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```
2. Or verify `REDIS_URL` for cloud Redis
3. If using Railway, Redis service auto-configures `REDIS_URL`

---

### "API quota exceeded"

**Problem:** "429 Too Many Requests" from Gemini API

**Solution:**
1. Free tier has 60 requests/min limit
2. Add rate limiting to backend:
   ```typescript
   const limiter = rateLimit({
     windowMs: 60000,
     max: 10  // Reduce limit per user
   });
   ```
3. Upgrade to paid tier if sustained traffic

---

## Security Best Practices

1. **Never commit `.env` files**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Rotate API keys regularly**
   - Every 90 days minimum
   - Immediately if compromised
   - Document rotation log

3. **Use different keys per environment**
   - Development: Separate free-tier keys
   - Production: Paid tier keys
   - Never mix environments

4. **Store secrets in password manager**
   - 1Password, Bitwarden, LastPass, etc.
   - Share with team securely
   - Document which key is which

5. **Monitor API usage**
   - Set up billing alerts
   - Monitor usage dashboards
   - Scale vertically before quota hit

---

## Quick Start

```bash
# 1. Copy template
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Edit .env files with your API keys
nano backend/.env
nano frontend/.env.local

# 3. Start local services
docker-compose up -d

# 4. Run development servers
npm run dev

# 5. Visit http://localhost:3000
```

---

**Last Updated:** Jan 2026  
**Status:** ✅ Complete
