# Signhify AI — Production Deployment Guide

> **Creator**: Piyush Raj Singh  
> **Date**: June 18, 2026  
> **Version**: 3.0.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
6. [Cache Setup (Upstash Redis)](#cache-setup-upstash-redis)
7. [Environment Variables](#environment-variables)
8. [DNS Configuration](#dns-configuration)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with Signhify AI repository
- [ ] Vercel account (free tier available)
- [ ] Render account (free tier available)
- [ ] MongoDB Atlas account (M0 free tier available)
- [ ] Upstash account (free tier available)
- [ ] Domain name (optional, for custom domain)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                │
│                    (Web Browser)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                         │
│               signhify-ai.vercel.app                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React + Vite + Tailwind v4                         │   │
│  │  - Static SPA deployment                            │   │
│  │  - Edge functions (optional)                        │   │
│  │  - Automatic HTTPS                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS API calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Render (Backend)                          │
│               signhify-ai-api.onrender.com                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Express.js API Server                              │   │
│  │  - JWT Authentication                               │   │
│  │  - Rate Limiting                                    │   │
│  │  - SSE Streaming                                    │   │
│  │  - Cron Scheduling                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────┬─────────────────────────────┬───────────────────┘
            │                             │
            ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     MongoDB Atlas         │   │     Upstash Redis         │
│   (M0 Free Tier)          │   │   (Serverless Free)       │
│  - Users                  │   │  - Session cache          │
│  - Threads                │   │  - Rate limiting          │
│  - Memory                 │   │  - Provider cache         │
│  - Skills                 │   │                           │
└───────────────────────────┘   └───────────────────────────┘
```

---

## Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import the `signhify-ai` repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter @signhify/web build`
   - **Output Directory**: `dist`
   - **Install Command**: `cd ../.. && pnpm install`

### Step 2: Environment Variables

Add the following in Vercel dashboard:

```bash
# No environment variables needed for frontend
# API calls are proxied to the backend via CORS
```

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Note the deployment URL (e.g., `signhify-ai.vercel.app`)

### Step 4: Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Configure DNS as instructed by Vercel
4. Enable automatic HTTPS

---

## Backend Deployment (Render)

### Step 1: Create Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `signhify-ai-api`
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free (for testing) or Starter (for production)

### Step 2: Environment Variables

Add the following in Render dashboard:

```bash
# Required
NODE_ENV=production
PORT=4000
JWT_SECRET=<generate-new-64-char-random-string>
JWT_REFRESH_SECRET=<generate-new-64-char-random-string>
MONGODB_URI=<your-mongodb-atlas-connection-string>

# Optional (but recommended)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
REDIS_URL=<your-upstash-redis-url>

# Optional (for additional features)
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
DISCORD_BOT_TOKEN=<your-discord-bot-token>
TAVILY_API_KEY=<your-tavily-api-key>
```

**Generate secure secrets:**

```bash
# Run this in your terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (~5-10 minutes)
3. Note the service URL (e.g., `signhify-ai-api.onrender.com`)

### Step 4: Configure Health Check

Render automatically uses the health check endpoint configured in `render.yaml`:

- **Health Check Path**: `/api/health`
- **Health Check Policy**: Automatic

---

## Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a new cluster (M0 Free Tier)
3. Choose a region close to your Render backend

### Step 2: Configure Access

1. Go to **Security → Network Access**
2. Add IP Address: `0.0.0.0/0` (allow all IPs)
   - _Note: For production, restrict to Render's IP range_

### Step 3: Create Database User

1. Go to **Security → Database Access**
2. Add a new database user
3. Use a strong password
4. Set permissions: **Read and write to any database**

### Step 4: Get Connection String

1. Go to **Deployment → Database**
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add `/signhify` to the database name

Example:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/signhify?retryWrites=true&w=majority
```

---

## Cache Setup (Upstash Redis)

### Step 1: Create Database

1. Go to [upstash.com](https://upstash.com)
2. Sign in with GitHub
3. Click **"Create Database"**
4. Choose:
   - **Name**: `signhify-cache`
   - **Region**: Same as Render backend
   - **Plan**: Free (10K commands/day)

### Step 2: Get Connection URL

1. Go to your database details
2. Click **"Connect"**
3. Copy the **Redis URL**
4. Format: `rediss://default:password@host:port`

### Step 3: Add to Render

Add the Redis URL to your Render environment variables:

```bash
REDIS_URL=rediss://default:xxxxx@xxxxx.upstash.io:xxxxx
```

---

## Environment Variables

### Complete Reference

| Variable             | Required | Description                         | Example                   |
| -------------------- | -------- | ----------------------------------- | ------------------------- |
| `NODE_ENV`           | Yes      | Environment                         | `production`              |
| `PORT`               | Yes      | Server port                         | `4000`                    |
| `JWT_SECRET`         | Yes      | JWT signing secret (min 64 chars)   | `<random-64-char-string>` |
| `JWT_REFRESH_SECRET` | Yes      | Refresh token secret (min 64 chars) | `<random-64-char-string>` |
| `MONGODB_URI`        | Yes      | MongoDB connection string           | `mongodb+srv://...`       |
| `CORS_ORIGIN`        | Yes      | Frontend URL for CORS               | `https://app.vercel.app`  |
| `REDIS_URL`          | No       | Redis connection URL                | `rediss://...`            |
| `TELEGRAM_BOT_TOKEN` | No       | Telegram bot token                  | `123456:ABC-DEF...`       |
| `DISCORD_BOT_TOKEN`  | No       | Discord bot token                   | `MTIz...`                 |
| `TAVILY_API_KEY`     | No       | Tavily search API key               | `tvly-...`                |

### Security Checklist

- [ ] Never commit secrets to git
- [ ] Use strong, random secrets (64+ characters)
- [ ] Rotate secrets periodically
- [ ] Use HTTPS everywhere
- [ ] Enable MongoDB IP whitelist
- [ ] Set strong Redis password

---

## DNS Configuration

### For Custom Domain

If using a custom domain (e.g., `signhify.ai`):

#### Frontend (Vercel)

```
Type    Name    Value
CNAME   www     cname.vercel-dns.com
A       @       76.76.21.21
```

#### Backend (Render)

```
Type    Name    Value
CNAME   api     signhify-ai-api.onrender.com
```

### SSL/TLS

- Vercel: Automatic HTTPS with Let's Encrypt
- Render: Automatic HTTPS with Let's Encrypt
- MongoDB Atlas: TLS 1.3 by default
- Upstash: TLS by default

---

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-06-18T00:00:00.000Z",
  "version": "3.0.0",
  "features": ["multi-llm", "multi-provider-fallback", ...]
}
```

### 2. Frontend Access

Open your Vercel URL in a browser:

```
https://your-frontend.vercel.app
```

### 3. Authentication Test

1. Register a new account
2. Login with credentials
3. Verify JWT tokens are working
4. Test refresh token flow

### 4. API Key Test

1. Go to Settings → API Keys
2. Add a test API key (e.g., Groq free tier)
3. Send a chat message
4. Verify response

### 5. Provider Health Check

```bash
curl https://your-backend.onrender.com/api/providers/health
```

---

## Monitoring & Maintenance

### Health Monitoring

1. **Render Health Checks**: Automatic
2. **MongoDB Atlas Monitoring**: Built-in dashboard
3. **Upstash Metrics**: Real-time command metrics

### Log Monitoring

1. **Render Logs**: Available in dashboard
2. **MongoDB Logs**: Atlas → Deployment → Logs

### Backup Strategy

1. **MongoDB Atlas**: Automatic backups (M0: continuous)
2. **Redis**: Upstash provides automatic persistence

### Scaling

1. **Frontend**: Vercel auto-scales
2. **Backend**: Render auto-scales (paid plans)
3. **Database**: Upgrade MongoDB Atlas tier as needed
4. **Cache**: Upstash scales automatically

### Cost Estimates

| Service       | Free Tier          | Starter Plan |
| ------------- | ------------------ | ------------ |
| Vercel        | 100GB bandwidth/mo | $20/mo       |
| Render        | 750 hours/mo       | $7/mo        |
| MongoDB Atlas | 512MB storage      | $9/mo        |
| Upstash       | 10K commands/day   | $10/mo       |
| **Total**     | **$0/mo**          | **~$46/mo**  |

---

## Troubleshooting

### Common Issues

| Issue                     | Solution                                        |
| ------------------------- | ----------------------------------------------- |
| CORS errors               | Check `CORS_ORIGIN` matches frontend URL        |
| 401 Unauthorized          | Verify `JWT_SECRET` is set and ≥32 chars        |
| MongoDB connection failed | Check `MONGODB_URI` and IP whitelist            |
| Redis connection failed   | Check `REDIS_URL` (optional, app works without) |
| Build fails               | Check Node.js version ≥20, pnpm ≥9.15           |

### Debug Commands

```bash
# Check backend health
curl https://your-backend.onrender.com/api/health

# Check provider health
curl https://your-backend.onrender.com/api/providers/health

# Check MongoDB connection
curl https://your-backend.onrender.com/api/health | jq .status
```

---

## Next Steps

After successful deployment:

1. **Rotate all exposed API keys** (from the security audit)
2. **Set up monitoring alerts**
3. **Configure custom domain** (if using)
4. **Enable automatic deployments** from main branch
5. **Set up CI/CD pipeline** (GitHub Actions)
6. **Add analytics** (optional)
7. **Submit to Product Hunt** (for launch)

---

## Support

For deployment issues:

- **GitHub Issues**: [github.com/Warriorlegacy/signhify-ai/issues](https://github.com/Warriorlegacy/signhify-ai/issues)
- **Creator**: [Piyush Raj Singh](https://linkedin.com/in/piyushraj-singh)

---

<div align="center">

**Built with ❤️ by Piyush Raj Singh**

_"Type less. Signhify everything."_

</div>
