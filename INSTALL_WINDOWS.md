# Installation Guide — Windows

## Prerequisites

### 1. Install Node.js (v20+)

Download and install from [nodejs.org](https://nodejs.org/) — choose the **LTS** version (v22 recommended).

Verify installation:

```powershell
node --version   # Should show v20+
npm --version    # Should show v10+
```

### 2. Install pnpm

```powershell
corepack enable
corepack prepare pnpm@10.10.0 --activate
```

Verify:

```powershell
pnpm --version   # Should show 10.x
```

### 3. Install Git

Download from [git-scm.com](https://git-scm.com/download/win). Use default settings during install.

Verify:

```powershell
git --version
```

### 4. Install MongoDB

**Option A: Docker Desktop (Recommended)**

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. Open PowerShell and run:

```powershell
docker run -d -p 27017:27017 --name signhify-mongo mongo:7
```

**Option B: MongoDB Community Server**

1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the MSI installer, choose "Complete" installation
3. Select "Run service as Network Service user"
4. Default port `27017` is fine

**Option C: MongoDB Atlas (Cloud, no install)**

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account → Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string — you'll use it as `MONGODB_URI`

### 5. Install Redis (Optional)

Redis improves caching performance but is not required.

**Option A: Docker (Recommended)**

```powershell
docker run -d -p 6379:6379 --name signhify-redis redis:7-alpine
```

**Option B: Manual Install**

1. Download from [redis.io/download](https://redis.io/download/)
2. Or use WSL2: `sudo apt install redis-server`

---

## Installation Steps

Open **PowerShell** or **Windows Terminal**:

```powershell
# 1. Clone the repository
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai

# 2. Install dependencies
pnpm install

# 3. Set up environment
Copy-Item server\.env.example server\.env
```

Edit `server\.env` with Notepad or VS Code:

```powershell
notepad server\.env
```

Set these values:

```env
JWT_SECRET=my-super-secret-key-at-least-32-characters
MONGODB_URI=mongodb://localhost:27017/signhify
PORT=4000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

```powershell
# 4. Start the development server
pnpm dev
```

Open **http://localhost:5173** in your browser.

---

## Docker Installation (One Command)

If you have Docker Desktop installed:

```powershell
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai

Copy-Item server\.env.example server\.env
# Edit server\.env with your JWT_SECRET

docker compose up -d --build
```

Open **http://localhost** in your browser.

---

## Installing the CLI

```powershell
# From the project root
cd packages\cli
pnpm build
pnpm link --global

# Verify
signhify --version
```

### CLI Quick Start

```powershell
# Set your server URL
signhify config

# Login
signhify login

# Chat with agents
signhify ask "Research the latest AI news"

# Open interactive TUI
signhify tui
```

---

## Windows-Specific Notes

- **Port conflicts**: If port 4000 is in use: `netstat -ano | findstr :4000` then `taskkill /PID <PID> /F`
- **Path length issues**: Enable long paths in Git: `git config --system core.longpaths true`
- **Line endings**: Git should auto-handle CRLF. If you get errors, run: `git config --global core.autocrlf true`
- **Firewall**: Allow Node.js through Windows Firewall when prompted
- **Docker issues**: Ensure WSL2 is enabled: `wsl --install`

---

## Troubleshooting

| Problem                   | Solution                                                     |
| ------------------------- | ------------------------------------------------------------ |
| `pnpm: command not found` | Run `corepack enable` and reopen terminal                    |
| `MongoNetworkError`       | Ensure MongoDB is running: `docker ps` or check Services app |
| `EADDRINUSE`              | Port is taken — change `PORT` in `.env` or kill the process  |
| `Cannot find module`      | Run `pnpm install` from project root                         |
| `Permission denied`       | Run PowerShell as Administrator                              |
| Docker build fails        | Ensure Docker Desktop is running and WSL2 backend is enabled |
