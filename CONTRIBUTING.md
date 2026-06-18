# Contributing to Signhify AI

First off, thank you for considering contributing to Signhify AI! 🎉

Signhify AI was created by [Piyush Raj Singh](https://LinkedIn.com/in/piyushraj-singh) and is open to contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive, and harassment-free environment. Be kind, be respectful, and help each other grow.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** 9.15.0 (install via `corepack enable && corepack prepare pnpm@9.15.0`)
- **MongoDB** 7+ (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)
- **Redis** 7+ (optional, for caching)
- **Git**
- **Docker** (optional, for containerized development)

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/signhify-ai.git
cd signhify-ai

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your values (see ENVIRONMENT_VARIABLES_GUIDE.md)

# 4. Start MongoDB (Docker recommended)
docker compose up -d mongo redis

# 5. Start development servers
pnpm dev
```

The web app will be at `http://localhost:5173` and the API at `http://localhost:4000`.

### Project Structure

```
signhify-ai/
├── apps/
│   ├── web/                    # React + Vite frontend
│   └── desktop/                # Electron desktop app
├── packages/
│   ├── types/                  # Shared TypeScript interfaces
│   ├── memory/                 # Memory store and embeddings
│   ├── agents/                 # AI agents and LLM adapters
│   ├── cli/                    # Command-line interface
│   └── vscode-extension/       # VS Code extension
├── server/
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Mongoose schemas
│   │   └── lib/                # Utilities
│   └── .env.example
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # Workspace packages
└── docker-compose.yml          # Development services
```

### Build Order

The monorepo has a strict build dependency order:

```
types → memory → agents → server → web
```

`pnpm build` handles this automatically via Turborepo.

## How to Contribute

### Reporting Bugs

- Use [GitHub Issues](https://github.com/Warriorlegacy/signhify-ai/issues)
- Include steps to reproduce, expected behavior, and actual behavior
- Include browser/OS/Node version info
- Check existing issues to avoid duplicates

### Suggesting Features

- Open an issue with the `[Feature Request]` prefix
- Describe the use case, not just the solution
- Be open to discussion about alternatives
- Check existing issues and discussions first

### Code Contributions

1. **Check existing issues** for something to work on
2. **Comment on the issue** to let others know you're working on it
3. **Fork the repo** and create a feature branch
4. **Write tests** for your changes
5. **Submit a PR** following the process below

## Pull Request Process

### 1. Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding tests

### 2. Commit Messages

Use clear, descriptive messages:

```
feat: add new agent for data analysis
fix: resolve memory leak in SSE streaming
docs: update API reference for /chat endpoint
refactor: extract chat orchestrator service
test: add integration tests for auth middleware
```

### 3. Quality Gate

Ensure all checks pass before submitting:

```bash
pnpm typecheck    # TypeScript compilation
pnpm lint         # Linting
pnpm build        # Full build
pnpm test         # All tests
```

### 4. PR Description

Use the following template:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### 5. Review Process

- All PRs require at least one review
- Address feedback promptly
- Keep PRs focused and small when possible
- Squash commits before merging

## Style Guide

### TypeScript

- Use strict mode TypeScript throughout
- Prefer `interface` over `type` for object shapes
- Use Zod for runtime validation at API boundaries
- Export types from `@signhify/types` — don't duplicate
- Avoid `any` — use proper types

### Naming Conventions

```typescript
// Variables and functions: camelCase
const userName = "Piyush";
function getUser() {}

// Classes: PascalCase
class User {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com";

// Files: kebab-case
user - service.ts;
```

### React (Frontend)

- Use functional components with hooks
- State management via Zustand stores
- Tailwind CSS v4 for styling
- Follow existing component patterns in `apps/web/src/components`

### Express (Backend)

- Use the route → middleware → service pattern
- Validate all inputs with Zod
- Use structured logging via `createContextLogger`
- Handle errors with the centralized error handler

### Error Handling

```typescript
// Always handle errors explicitly
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error("Operation failed", { error });
  throw new AppError("Operation failed", 500);
}
```

### Async/Await

```typescript
// Prefer async/await over callbacks
async function getUser(id: string): Promise<User> {
  const user = await db.users.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
}
```

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Single package
pnpm --filter @signhify/agents test

# Watch mode
pnpm --filter @signhify/agents test --watch
```

### Writing Tests

- Use Vitest for all tests
- Place tests in `__tests__/` directories alongside source
- Name test files `*.test.ts` or `*.test.tsx`
- Aim for 80%+ coverage on new code
- Test edge cases and error scenarios
- Mock external dependencies

### Test Coverage

```bash
# Generate coverage report
pnpm --filter @signhify/agents test --coverage
```

## Documentation

### Code Documentation

- Use JSDoc for public APIs
- Document complex algorithms
- Explain business logic
- Add comments for non-obvious code

### README Updates

- Update if adding features
- Keep examples current
- Fix typos and grammar
- Add screenshots for UI changes

### API Documentation

- Document new endpoints
- Include request/response examples
- Update OpenAPI spec if applicable

## Adding New Agents

Follow the pattern in `packages/agents/src/*/index.ts`:

1. Create a new directory in `packages/agents/src/your-agent/`
2. Export from `packages/agents/src/index.ts`
3. Add the agent type to `AgentType` in types and nexus router
4. Wire up in `server/src/services/chat-orchestrator.ts`
5. Add tests for the new agent
6. Update documentation

## Adding New LLM Providers

1. Create adapter in `packages/agents/src/adapters/`
2. Implement `LLMAdapter` interface
3. Register in `ProviderManager`
4. Add to free models registry if applicable
5. Update `@signhify/types` with new provider ID
6. Add tests

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (coming soon)

### Getting Help

- Check existing documentation
- Search GitHub issues
- Ask in discussions
- Reach out to maintainers

### Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Annual contributor highlights

## Questions?

If you have questions about contributing, feel free to:

1. Open a GitHub Discussion
2. Check existing documentation
3. Ask in discussions
4. Reach out to the maintainer

---

**Thank you for contributing to Signhify AI!** 🚀

_Together, we're democratizing AI for everyone._

_Created by [Piyush Raj Singh](https://LinkedIn.com/in/piyushraj-singh) — Solo Creator of Signhify AI_
