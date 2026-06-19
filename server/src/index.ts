import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import pinoHttp from "pino-http";
import morgan from "morgan";
import cron from "node-cron";

import { validateEnv } from "./lib/env";
import { createContextLogger } from "./lib/logger";
import { connectRedis, disconnectRedis } from "./lib/redis";
import { initTelemetry, recordRequest } from "./lib/telemetry";

import authRoutes from "./routes/auth";
import agentRoutes from "./routes/agents";
import threadRoutes from "./routes/threads";
import userRoutes from "./routes/users";
import noteRoutes from "./routes/notes";
import skillRoutes from "./routes/skills";
import scheduleRoutes from "./routes/schedule";
import profileRoutes from "./routes/profile";
import memoryRoutes from "./routes/memory";
import telegramRoutes, { initTelegramBot } from "./routes/telegram";
import discordRoutes, { initDiscordBot } from "./routes/discord";
import providerRoutes from "./routes/providers";
import completeRoutes from "./routes/complete";
import { errorHandler } from "./middleware/errorHandler";
import { initScheduler } from "./services/scheduler";
import { initProfileRegeneration } from "./services/profile-regeneration";

const log = createContextLogger("server");

const app = express();

// Validate env on startup (fails fast on missing required vars)
const env = validateEnv();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: [
          "'self'",
          "https://api.openai.com",
          "https://api.anthropic.com",
          "https://api.groq.com",
          "https://generativelanguage.googleapis.com",
          "https://openrouter.ai",
          "https://api.mistral.ai",
          "https://api.together.xyz",
          "https://api.cerebras.ai",
          "https://api.sambanova.ai",
          "https://api.cloudflare.com",
          "https://api.tavily.com",
          "https://api.elevenlabs.io",
        ],
        workerSrc: ["'self'", "blob:"],
      },
    },
  }),
);
const allowedOrigins = env.CORS_ORIGIN.split(",").map(o => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      // Allow any Vercel deployment of Signhify AI (e.g. signhify-ai.vercel.app, signhify-ai-web.vercel.app)
      if (/^https:\/\/signhify-ai(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Initialize telemetry
initTelemetry();

// Request metrics middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    recordRequest(req.method, req.path, res.statusCode);
  });
  next();
});

// Structured request logging in production
if (env.NODE_ENV === "production") {
  app.use(
    pinoHttp({
      logger: log as any,
      autoLogging: {
        ignore: (req: any) => req.url === "/api/health",
      },
    }),
  );
} else {
  app.use(morgan("dev"));
}

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/memory", memoryRoutes);
app.use("/api/gateways/telegram", telegramRoutes);
app.use("/api/gateways/discord", discordRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/agents/complete", completeRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "3.0.0",
    features: [
      "multi-llm",
      "multi-provider-fallback",
      "free-model-routing",
      "persistent-memory",
      "skill-generation",
      "scheduling",
      "provider-abstraction",
      "circuit-breaker",
      "redis-cache",
    ],
  });
});

// Serve static assets in production
if (env.NODE_ENV === "production") {
  const webDist = path.join(__dirname, "../../apps/web/dist");
  app.use(express.static(webDist));
  // SPA fallback — must come AFTER all API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

app.use(errorHandler);

async function start() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    log.info("Connected to MongoDB");

    // Connect to Redis (optional, graceful degradation)
    const redisOk = await connectRedis();
    if (redisOk) {
      log.info("Redis cache enabled");
    } else {
      log.warn("Redis not available — running without cache");
    }

    // Initialize cron scheduler after DB is ready
    await initScheduler();
    log.info("Scheduler initialized");

    // Initialize weekly profile regeneration
    initProfileRegeneration();
    log.info("Profile regeneration cron initialized");

    // Initialize gateways
    initTelegramBot();
    initDiscordBot();

    app.listen(env.PORT, () => {
      log.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          features: ["multi-llm", "memory", "skills", "scheduling", "redis"],
        },
        "Signhify AI v3 server running",
      );

      // Keep-alive: ping self every 10 min to prevent free-tier spin-down
      if (env.NODE_ENV === "production") {
        cron.schedule("*/10 * * * *", async () => {
          try {
            const res = await fetch(`http://localhost:${env.PORT}/api/health`);
            log.debug({ status: res.status }, "Keep-alive ping");
          } catch {
            log.warn("Keep-alive ping failed");
          }
        });
        log.info("Keep-alive cron started (every 10 min)");
      }
    });
  } catch (error) {
    log.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  log.info("SIGTERM received, shutting down...");
  await disconnectRedis();
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  log.info("SIGINT received, shutting down...");
  await disconnectRedis();
  await mongoose.disconnect();
  process.exit(0);
});

start();
