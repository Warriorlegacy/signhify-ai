# 📖 Signhify AI Quick Reference Guide

Essential commands, workflows, and shortcuts for development.

---

## Table of Contents

1. [Local Development](#local-development)
2. [Git Workflow](#git-workflow)
3. [Testing](#testing)
4. [Database](#database)
5. [Deployment](#deployment)
6. [Debugging](#debugging)
7. [Common Tasks](#common-tasks)

---

## Local Development

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Signhify/signhify-ai.git
cd signhify-ai

# Install dependencies
npm install

# Setup environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit with your API keys
nano backend/.env

# Start Docker services
docker-compose up -d

# Run development servers
npm run dev

# Visit
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart service
docker-compose restart postgres
docker-compose restart redis

# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Quick Restart

```bash
# Kill and restart everything
npm run dev:restart
# Equivalent to:
# docker-compose down && docker-compose up -d && npm run dev
```

---

## Git Workflow

### Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/voice-input

# Work on feature...

# Commit frequently
git add .
git commit -m "feat: implement voice input UI component (#42)"

# Push to GitHub
git push -u origin feat/voice-input

# Create Pull Request on GitHub
# - Title: "feat: implement voice input UI component"
# - Description: Describe the change
# - Link to issue: "Closes #42"
# - Wait for CI to pass
# - Request review

# After approval, merge on GitHub (use "Squash and merge")
```

### Commit Message Format

```bash
# Format: <type>: <description> (<issue>)

# Types: feat, fix, docs, style, refactor, test, chore, ci

# Examples:
git commit -m "feat: add voice command support (#45)"
git commit -m "fix: resolve rate limiting bug in API (#68)"
git commit -m "docs: update README with deployment steps (#12)"
git commit -m "test: add unit tests for Master Agent (#89)"
git commit -m "refactor: optimize database queries (#34)"
```

### Sync with Main

```bash
# Before starting work
git checkout main
git pull origin main
git checkout your-branch
git rebase main

# Resolve conflicts
git add .
git rebase --continue

# Or merge (if prefer)
git merge main
```

### Undo Changes

```bash
# Undo uncommitted changes
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo pushed commit (advanced, creates new commit)
git revert abc1234

# View reflog (recover deleted commits)
git reflog
git checkout abc1234
```

---

## Testing

### Run Tests

```bash
# All tests
npm run test

# Watch mode (re-run on file change)
npm run test:watch

# Specific test file
npm run test -- agents.test.ts

# With coverage
npm run test:coverage

# Update snapshots
npm run test -- -u
```

### Test Organization

```
tests/
├── unit/
│   ├── agents.test.ts
│   ├── api.test.ts
│   └── utils.test.ts
├── integration/
│   ├── commands.test.ts
│   ├── auth.test.ts
│   └── agents.test.ts
└── setup.ts
```

### Write Tests (Example)

```typescript
// File: backend/tests/unit/file-agent.test.ts
import { describe, it, expect } from 'vitest';
import { FileAgent } from '../../src/agents/file';

describe('FileAgent', () => {
  it('should list files in directory', async () => {
    const agent = new FileAgent();
    const result = await agent.execute('list /home/user', {});
    
    expect(result.success).toBe(true);
    expect(Array.isArray(result.files)).toBe(true);
  });

  it('should reject paths outside work directory', async () => {
    const agent = new FileAgent();
    const result = await agent.execute('list /etc/passwd', {});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Access denied');
  });
});
```

### Coverage Goals

```
Frontend:  >80%
Backend:   >80%
Overall:   >80%

Branch coverage: >70%
Function coverage: >85%
Line coverage: >85%
Statement coverage: >85%

View coverage:
npm run test:coverage
open coverage/index.html
```

---

## Database

### Supabase Local (Optional)

```bash
# Start local Supabase (requires Docker)
supabase start

# Stop
supabase stop

# Reset
supabase db reset
```

### Migrations

```bash
# View current schema
supabase db pull

# Create new migration
supabase migration new create_users_table

# Edit migration file
nano supabase/migrations/TIMESTAMP_create_users_table.sql

# Apply migration
supabase db push

# Rollback (careful!)
supabase migration list
supabase migration down
```

### Query Database

```bash
# Connect to Supabase from CLI
psql "postgresql://postgres:password@host:5432/postgres"

# List tables
\dt

# View table
SELECT * FROM commands LIMIT 10;

# View schema
\d commands

# Execute query from file
psql -f migrations/init.sql
```

### Backup & Restore

```bash
# Export data
pg_dump > backup.sql

# Import data
psql < backup.sql

# Supabase auto-backups
# Settings → Backups → View history
```

---

## Deployment

### Deploy Frontend (Vercel)

```bash
# Deploy to preview (from PR)
# Automatic on push to GitHub

# Deploy to production
# Merge to main → Automatic deployment

# Force deploy
npm run deploy:frontend
# or via Vercel CLI:
vercel --prod

# Check deployment
vercel ls
vercel inspect https://signhify-ai.vercel.app
```

### Deploy Backend (Railway)

```bash
# Automatic deployment on GitHub push
# No manual action needed

# Or via Railway CLI
railway up

# View logs
railway logs -f

# Rollback to previous version
railway rollback
```

### Monitor Deployments

```bash
# Vercel
# https://vercel.com/dashboard

# Railway
# https://railway.app/dashboard

# Status pages
# https://status.vercel.com
# https://railway.app/status
```

---

## Debugging

### Frontend Debugging

```bash
# Browser DevTools
# F12 or Cmd+Option+I
# Console, Network, Performance tabs

# VS Code Debugger
# .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}

# Debug in console
console.log('Debug:', variable);
debugger;  // Pauses execution
```

### Backend Debugging

```bash
# Enable debug logs
DEBUG=* npm run dev

# VS Code Debugger
# .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Node",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "console": "integratedTerminal"
    }
  ]
}

# Breakpoints
# Click line number in editor
# Step, Step Over, Step Into buttons
```

### Logging

```typescript
// Backend
import { logger } from './utils/logger';

logger.info('Starting server');
logger.warn('Missing env var: API_KEY');
logger.error('Database connection failed', error);
logger.debug('Query params:', params);

// Frontend
console.log('Action:', payload);
console.warn('Warning message');
console.error('Error:', error);

// Structured logging (production)
logger.info({
  action: 'command_executed',
  user_id: '550e8400-...',
  command: 'list files',
  status: 'completed'
});
```

### Network Debugging

```bash
# View API requests
# Browser DevTools → Network tab

# VS Code REST Client
# requests.http
@baseUrl = http://localhost:3001

POST {{baseUrl}}/api/commands
Authorization: Bearer token_here
Content-Type: application/json

{
  "content": "list files in ~/projects"
}

# Run with Ctrl+Alt+R
```

---

## Common Tasks

### Add New Environment Variable

```bash
# 1. Add to .env.example
echo "NEW_VAR=example_value" >> backend/.env.example

# 2. Add to .env (local)
echo "NEW_VAR=your_actual_value" >> backend/.env

# 3. Use in code
const newVar = process.env.NEW_VAR;

# 4. Add to Vercel/Railway
# Vercel: Project Settings → Environment Variables
# Railway: Variables tab → Add

# 5. Update GitHub Secrets (if used in CI)
# Settings → Secrets and Variables → Actions → New repository secret
```

### Add New API Endpoint

```typescript
// 1. Create route file
// backend/src/api/new-feature.ts

import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  // Handler
  res.json({ message: 'OK' });
});

export default router;

// 2. Register route
// backend/src/main.ts
import newFeatureRoutes from './api/new-feature';
app.use('/api/new-feature', verifyAuth, newFeatureRoutes);

// 3. Test
// curl http://localhost:3001/api/new-feature \
//   -H "Authorization: Bearer token"

// 4. Document in API_SPECIFICATION.md
```

### Add New Agent

```typescript
// 1. Create agent file
// backend/src/agents/my-agent.ts

export class MyAgent {
  async execute(command: string, params: any) {
    // Implementation
    return { success: true, result: 'data' };
  }
}

// 2. Register in master agent
// backend/src/agents/master.ts
this.agents = {
  ...this.agents,
  myagent: new MyAgent()
};

// 3. Add tests
// backend/tests/unit/my-agent.test.ts
describe('MyAgent', () => {
  // Tests
});

// 4. Document
// docs/agents/AGENT_GUIDE.md
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm install package@latest

# Major version update (careful!)
npm install package@major

# Update package.json
npm install --save package@^2.0.0

# Test after update
npm run test
npm run build

# Commit
git commit -m "chore: update dependencies"
```

### Fix Linting Issues

```bash
# Check for issues
npm run lint

# Auto-fix (if possible)
npm run lint -- --fix

# Format code
npm run format

# Format specific file
npx prettier --write filename.ts
```

### Clean Build Artifacts

```bash
# Remove build directories
npm run clean

# Equivalent to:
rm -rf dist/ .next/ node_modules/.cache/

# Full clean (⚠️ removes everything)
rm -rf node_modules/ package-lock.json
npm install
```

---

## Essential URLs

### Development
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

### Dashboards
- GitHub: https://github.com/Signhify/signhify-ai
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard
- Supabase: https://app.supabase.com
- Sentry: https://sentry.io/organizations/signhify/

### Services
- Google Cloud: https://console.cloud.google.com
- Groq: https://console.groq.com
- Tavily: https://app.tavily.com
- Deepgram: https://console.deepgram.com

---

## Keyboard Shortcuts

### VS Code
- `Ctrl+Shift+P` or `Cmd+Shift+P`: Command palette
- `Ctrl+`` (backtick): Terminal toggle
- `F12`: Debug
- `Ctrl+Shift+B`: Build
- `Ctrl+Shift+T`: Run test

### Browser DevTools
- `F12` or `Cmd+Option+I`: Open DevTools
- `Ctrl+Shift+C` or `Cmd+Shift+C`: Element inspector
- `Ctrl+Shift+J` or `Cmd+Option+J`: Console

### Git
- `git status`: Show status
- `git log --oneline`: View commit history
- `git diff`: Show changes
- `git stash`: Temporarily save changes

---

## Emergency Commands

```bash
# Kill process on port (if stuck)
lsof -ti:3001 | xargs kill -9  # Port 3001
lsof -ti:3000 | xargs kill -9  # Port 3000
lsof -ti:5432 | xargs kill -9  # Port 5432

# Clear Docker everything (⚠️ removes all containers!)
docker system prune -a

# Reset database (⚠️ deletes all data!)
docker-compose down -v
docker-compose up -d

# Recover from git mistakes
git reflog
git checkout abc1234  # Recover deleted commits

# Force push (⚠️ destructive! only on personal branches)
git push origin --force-with-lease
```

---

## Time-Savers

```bash
# Create bash alias
alias dev='npm run dev'
alias test='npm run test:watch'
alias build='npm run build'
alias deploy='npm run deploy:frontend'

# Add to ~/.bashrc or ~/.zshrc
echo "alias dev='npm run dev'" >> ~/.bashrc

# Source it
source ~/.bashrc

# Now just type:
dev    # Instead of npm run dev
test   # Instead of npm run test:watch
```

---

**Last Updated:** Jan 2026  
**Status:** ✅ Complete & Ready
