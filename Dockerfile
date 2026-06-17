FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/types/package.json packages/types/
COPY packages/memory/package.json packages/memory/
COPY packages/agents/package.json packages/agents/
COPY server/package.json server/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/types/node_modules /app/packages/types/node_modules
COPY --from=deps /app/packages/memory/node_modules /app/packages/memory/node_modules
COPY --from=deps /app/packages/agents/node_modules /app/packages/agents/node_modules
COPY --from=deps /app/server/node_modules /app/server/node_modules
COPY --from=deps /app/apps/web/node_modules /app/apps/web/node_modules
COPY . .
RUN pnpm --filter @signhify/types build && \
    pnpm --filter @signhify/memory build && \
    pnpm --filter @signhify/agents build && \
    pnpm --filter @signhify/server build && \
    pnpm --filter @signhify/web build

FROM base AS runner
RUN apk add --no-cache curl

# Copy compiled output
COPY --from=build /app/server/dist /app/server/dist
COPY --from=build /app/packages/types/dist /app/packages/types/dist
COPY --from=build /app/packages/memory/dist /app/packages/memory/dist
COPY --from=build /app/packages/agents/dist /app/packages/agents/dist
COPY --from=build /app/apps/web/dist /app/apps/web/dist

# Install production deps with pnpm (avoids broken symlinks from COPY)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY server/package.json server/
COPY packages/types/package.json packages/types/
COPY packages/memory/package.json packages/memory/
COPY packages/agents/package.json packages/agents/
COPY apps/web/package.json apps/web/
RUN pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1
CMD ["node", "server/dist/index.js"]
