import { z } from "zod";

const envSchema = z.object({
  // Required
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  MONGODB_URI: z
    .string()
    .url("MONGODB_URI must be a valid MongoDB connection string"),

  // Server
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .optional(),

  // Redis (optional)
  REDIS_URL: z.string().optional(),

  // LLM Provider Keys (at least one recommended, not required)
  GEMINI_API_KEY: z.string().optional(),
  SYSTEM_GEMINI_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),

  // Tools
  TAVILY_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),

  // Gateways
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  DISCORD_BOT_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate and parse environment variables.
 * Fails fast on missing required vars.
 */
export function validateEnv(): Env {
  if (validatedEnv) return validatedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const errors = Object.entries(formatted)
      .filter(([key]) => key !== "_errors")
      .map(([key, val]) => {
        const errs = (val as any)?._errors;
        return errs?.length ? `${key}: ${errs.join(", ")}` : null;
      })
      .filter(Boolean);

    console.error("❌ Environment validation failed:");
    errors.forEach((e) => console.error(`   ${e}`));
    process.exit(1);
  }

  validatedEnv = result.data;

  // Warn about missing LLM keys
  const hasLLM =
    validatedEnv.GEMINI_API_KEY ||
    validatedEnv.SYSTEM_GEMINI_KEY ||
    validatedEnv.GROQ_API_KEY ||
    validatedEnv.OPENAI_API_KEY ||
    validatedEnv.ANTHROPIC_API_KEY ||
    validatedEnv.OPENROUTER_API_KEY;

  if (!hasLLM) {
    console.warn(
      "⚠️  No LLM API keys configured. Users must provide their own via BYOK.",
    );
  }

  return validatedEnv;
}

/**
 * Get a validated env value (throws if not validated yet).
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error("Environment not validated. Call validateEnv() first.");
  }
  return validatedEnv;
}
