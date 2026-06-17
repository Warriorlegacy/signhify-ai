# Deployment Guides for Signhify AI

Actual stack: React + Vite (frontend), Express + MongoDB (backend)

---

## Recommendation: Vercel + Render + MongoDB Atlas

| Layer    | Platform          | Free Tier         | Always-on |
| -------- | ----------------- | ----------------- | --------- |
| Frontend | **Vercel**        | Yes, generous     | Yes       |
| Backend  | **Render**        | Yes (spins down)  | No\*      |
| Database | **MongoDB Atlas** | 512 MB M0 cluster | Yes       |

> \* Render free web services spin down after 15 min of inactivity.
> They wake automatically on the next request (~30s cold start).
> For always-on backend, upgrade to Render Starter ($7/mo).

> **Heroku**: No free tier since Nov 2022. Eco plan is $5/mo.
> **Netlify**: Good alternative to Vercel for the frontend (very similar).

---

## Frontend — Vercel (free)

### Prerequisites

- GitHub repo pushed
- Vercel account (vercel.com)

### Steps

1. Go to **vercel.com/new**
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `apps/web`
   - **Framework**: Vite
   - **Build Command**: `pnpm --filter @signhify/web build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://signhify-api.onrender.com/api`)
5. Click **Deploy**

### Local preview

```bash
pnpm --filter @signhify/web build && pnpm --filter @signhify/web preview
```

---

## Backend — Render (free)

### Prerequisites

- GitHub repo pushed
- Render account (render.com)

### Steps

1. Go to **dashboard.render.com** → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `signhify-ai-api`
   - **Runtime**: Docker
   - **Dockerfile Path**: `Dockerfile`
   - **Plan**: Free
4. Add environment variables:

```
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/signhify?retryWrites=true
JWT_SECRET=<at-least-32-random-chars>
CORS_ORIGIN=https://<your-vercel-domain>.vercel.app
```

5. Click **Create Web Service**

> The Dockerfile is already configured to build both the frontend and
> Express server into a single image. In production, the Express server
> serves the React SPA as static files.

### Option B: Deploy backend-only on Render (no Docker)

If you prefer not to use Docker, set:

- **Runtime**: Node
- **Build Command**: `pnpm install && pnpm --filter @signhify/types build && pnpm --filter @signhify/memory build && pnpm --filter @signhify/agents build && pnpm --filter @signhify/server build`
  **Start Command**: `node server/dist/index.js`
- **Root Directory**: leave empty (repo root)

---

## Database — MongoDB Atlas (free)

### Steps

1. Go to **mongodb.com/atlas** → **Start Free**
2. Create an **M0 cluster** (free, 512 MB)
3. Under **Network Access** → **Add IP Address** → `0.0.0.0/0` (allow all)
4. Under **Database Access** → create a database user
5. Click **Connect** → **Drivers** → copy the connection string
6. Set the string as `MONGODB_URI` on Render (replace `<password>`)

---

## Full-stack single-container alternative — Render with Docker

This repo's `Dockerfile` builds both frontend and backend into one image.
The server serves the React SPA as static files in production.

```bash
# Build and test locally
docker build -t signhify-ai .
docker run -p 4000:4000 --env-file server/.env signhify-ai
```

Deploy this via Render's Docker runtime (instructions above).  
The app is served on a single port: `https://signhify-api.onrender.com`

---

## Environment Variables Reference

| Variable       | Required | Description                           |
| -------------- | -------- | ------------------------------------- |
| `PORT`         | No       | Server port (default: 4000)           |
| `NODE_ENV`     | No       | `production` or `development`         |
| `MONGODB_URI`  | **Yes**  | MongoDB connection string             |
| `JWT_SECRET`   | **Yes**  | Secret for JWT signing (min 32 chars) |
| `CORS_ORIGIN`  | Yes\*    | Frontend URL for CORS                 |
| `VITE_API_URL` | Yes\*    | Frontend env: backend URL + `/api`    |

> \* Required in production only.

---

## Vite + Vercel config (already in repo)

`apps/web/vercel.json`:

```json
{
  "buildCommand": "pnpm --filter @signhify/web build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Render config (already in repo)

`render.yaml` at repo root — import this into Render for one-click setup:

```yaml
services:
  - type: web
    name: signhify-ai-api
    runtime: docker
    plan: free
    dockerfilePath: Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CORS_ORIGIN
        sync: false
```
