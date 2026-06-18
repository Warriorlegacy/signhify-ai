# Installation Guide — Linux

Covers Ubuntu, Debian, Fedora, RHEL, Arch, and other distributions.

## Prerequisites

### 1. Install Node.js (v20+)

**Ubuntu / Debian:**

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Fedora / RHEL:**

```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs
```

**Arch:**

```bash
sudo pacman -S nodejs npm
```

Verify:

```bash
node --version   # Should show v20+
npm --version    # Should show v10+
```

### 2. Install pnpm

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

Verify:

```bash
pnpm --version   # Should show 10.x
```

### 3. Install MongoDB

**Option A: Docker (Recommended)**

```bash
# Install Docker if not present
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in, then:
docker run -d -p 27017:27017 --name signhify-mongo mongo:7
```

**Option B: MongoDB Package**

Ubuntu / Debian:

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

Fedora / RHEL:

```bash
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Option C: MongoDB Atlas (Cloud, no install)**

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account → Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string

### 4. Install Redis (Optional)

Ubuntu / Debian:

```bash
sudo apt-get install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

Fedora:

```bash
sudo yum install -y redis
sudo systemctl start redis
sudo systemctl enable redis
```

Docker:

```bash
docker run -d -p 6379:6379 --name signhify-redis redis:7-alpine
```

---

## Installation Steps

Open your terminal:

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
# or: vim server/.env
# or: code server/.env  (VS Code)
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

## Running as a Systemd Service

To keep Signhify running in the background:

```bash
# Build for production
pnpm build

# Create systemd service
sudo tee /etc/systemd/system/signhify.service <<EOF
[Unit]
Description=Signhify AI Server
After=network.target mongod.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) server/dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=4000
EnvironmentFile=$(pwd)/server/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable signhify
sudo systemctl start signhify

# Check status
sudo systemctl status signhify
```

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

## Linux-Specific Notes

- **Firewall (UFW)**: Allow ports if needed:
  ```bash
  sudo ufw allow 5173    # Vite dev server
  sudo ufw allow 4000    # Express API
  sudo ufw allow 27017   # MongoDB
  ```
- **SELinux (RHEL/Fedora)**: If MongoDB won't start:
  ```bash
  sudo semanage port -a -t mongod_port_t -p tcp 27017
  ```
- **MongoDB bind IP**: Ensure `mongod.conf` has `bindIp: 127.0.0.1` for local-only access
- **Node version manager**: Consider [nvm](https://github.com/nvm-sh/nvm) for managing multiple Node versions:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 22
  nvm use 22
  ```

---

## Troubleshooting

| Problem                    | Solution                                                                 |
| -------------------------- | ------------------------------------------------------------------------ |
| `pnpm: command not found`  | Run `corepack enable` and restart terminal                               |
| `MongoNetworkError`        | Ensure MongoDB is running: `sudo systemctl status mongod` or `docker ps` |
| `EADDRINUSE`               | Port taken — change `PORT` in `.env` or: `kill $(lsof -ti:4000)`         |
| `Cannot find module`       | Run `pnpm install` from project root                                     |
| `EACCES permission denied` | Don't use `sudo npm install` — fix npm permissions or use nvm            |
| `Error: listen EACCES`     | Port below 1024 requires root — use port >1024                           |
| Docker permission denied   | Add user to docker group: `sudo usermod -aG docker $USER`                |
| MongoDB won't start        | Check logs: `sudo journalctl -u mongod`                                  |
| `ENOSPC` (disk full)       | Clean Docker: `docker system prune -a`                                   |
