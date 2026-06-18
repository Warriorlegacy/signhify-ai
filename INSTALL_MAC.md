# Installation Guide — macOS

## Prerequisites

### 1. Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (v20+)

```bash
brew install node@22
brew link node@22
```

Verify:

```bash
node --version   # Should show v20+
npm --version    # Should show v10+
```

### 3. Install pnpm

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

Verify:

```bash
pnpm --version   # Should show 10.x
```

### 4. Install MongoDB

**Option A: Docker (Recommended)**

1. Install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. Open Terminal:

```bash
docker run -d -p 27017:27017 --name signhify-mongo mongo:7
```

**Option B: MongoDB via Homebrew**

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Option C: MongoDB Atlas (Cloud, no install)**

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account → Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string

### 5. Install Redis (Optional)

```bash
brew install redis
brew services start redis
```

Or via Docker:

```bash
docker run -d -p 6379:6379 --name signhify-redis redis:7-alpine
```

---

## Installation Steps

Open **Terminal**:

```bash
# 1. Clone the repository
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp server/.env.example server/.env
```

Edit `server/.env`:

```bash
nano server/.env
# or: code server/.env  (VS Code)
# or: open -a "TextEdit" server/.env
```

Set these values:

```env
JWT_SECRET=my-super-secret-key-at-least-32-characters
MONGODB_URI=mongodb://localhost:27017/signhify
PORT=4000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

```bash
# 4. Start the development server
pnpm dev
```

Open **http://localhost:5173** in your browser.

---

## Docker Installation (One Command)

```bash
git clone https://github.com/Warriorlegacy/signhify-ai.git
cd signhify-ai

cp server/.env.example server/.env
# Edit server/.env with your JWT_SECRET

docker compose up -d --build
```

Open **http://localhost** in your browser.

---

## Installing the CLI

```bash
cd packages/cli
pnpm build
pnpm link --global

# Verify
signhify --version
```

### CLI Quick Start

```bash
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

## macOS-Specific Notes

- **Apple Silicon (M1/M2/M3)**: Everything works natively — no Rosetta needed
- **MongoDB permission issues**: If `brew services start` fails: `sudo chown -R $(whoami) /usr/local/var/mongodb`
- **Port 27017 in use**: `lsof -ti:27017 | xargs kill -9`
- **Firewall prompts**: Allow Node.js network access when macOS asks
- **Homebrew path**: If `brew` isn't found, add to your shell profile:
  ```bash
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  eval "$(/opt/homebrew/bin/brew shellenv)"
  ```

---

## Troubleshooting

| Problem                                | Solution                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm: command not found`              | Run `corepack enable` and restart terminal                                |
| `MongoNetworkError`                    | Ensure MongoDB is running: `brew services list` or `docker ps`            |
| `EADDRINUSE`                           | Port taken — change `PORT` in `.env` or: `lsof -ti:4000 \| xargs kill -9` |
| `Cannot find module`                   | Run `pnpm install` from project root                                      |
| `EACCES permission denied`             | Don't use `sudo npm install` — fix npm permissions: `mkdir ~/.npm-global` |
| Docker build fails                     | Ensure Docker Desktop is running                                          |
| `warning: LF will be replaced by CRLF` | Normal on macOS, can ignore                                               |
