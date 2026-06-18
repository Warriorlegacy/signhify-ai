# Render Environment Variables Setup

## Quick Setup

Run this command to set environment variables via Render CLI:

```bash
# First, get your Render service ID
render services list --output json

# Then set environment variables (replace SERVICE_ID with your actual service ID)
# Note: Render CLI doesn't support setting env vars directly, use the dashboard instead
```

## Manual Setup (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **signhify-ai** service
3. Go to **Environment** tab
4. Add the following environment variables:

### Required Variables

| Key                  | Value                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`           | `production`                                                                                                                       |
| `PORT`               | `4000`                                                                                                                             |
| `MONGODB_URI`        | `mongodb+srv://rajpiyush092_db_user:uoQ7att2oqsDSf46@cluster0.xfzax7j.mongodb.net/signhify?retryWrites=true&w=majority`            |
| `JWT_SECRET`         | `a8d369226ea26191b00a9763f9424ad7e7aedafa5c982c4e574f0ec66bad38e56e0f75eeffbd4c8bac192514d68c7328945909406023c1f608974ef9ef885076` |
| `JWT_REFRESH_SECRET` | `6c1a5c76300b6cd9769375e7fea331a19180b1358545a0b2ae7a91157445b687e345a9a3d4bcd518328a33c5998b768c0629e450ecdc47e77abae84095809d46` |
| `CORS_ORIGIN`        | `https://signhify-ai.vercel.app`                                                                                                   |

### Optional Variables

| Key                  | Value                                |
| -------------------- | ------------------------------------ |
| `REDIS_URL`          | _(Your Upstash Redis URL if using)_  |
| `TELEGRAM_BOT_TOKEN` | _(Your Telegram bot token if using)_ |
| `DISCORD_BOT_TOKEN`  | _(Your Discord bot token if using)_  |

5. Click **Save Changes**
6. The service will automatically redeploy

## Verify Deployment

After deployment completes (~5-10 minutes), test the health endpoint:

```bash
curl https://signhify-ai.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-06-18T00:00:00.000Z",
  "version": "3.0.0"
}
```

## Frontend Configuration

The frontend is already deployed to:

- **Production**: https://signhify-ai.vercel.app

Make sure the frontend is configured to call the correct backend URL:

- **Backend API**: https://signhify-ai.onrender.com
