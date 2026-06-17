import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth";
import agentRoutes from "./routes/agents";
import threadRoutes from "./routes/threads";
import userRoutes from "./routes/users";
import noteRoutes from "./routes/notes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ?? 3001;
const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/signhify";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV ?? "development";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

if (NODE_ENV === "production") {
  const webDist = path.join(__dirname, "../../apps/web/dist");
  app.use(express.static(webDist));
}

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (NODE_ENV === "production") {
  const webDist = path.join(__dirname, "../../apps/web/dist");
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

app.use(errorHandler);

function validateEnv() {
  const required = ["JWT_SECRET", "MONGODB_URI"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (NODE_ENV === "production" && !CORS_ORIGIN.startsWith("http")) {
    console.warn("Warning: CORS_ORIGIN looks misconfigured for production");
  }
}

async function start() {
  validateEnv();
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Signhify AI server running on port ${PORT} (${NODE_ENV})`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
