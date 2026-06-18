import Redis from "ioredis";

let redis: Redis | null = null;

/**
 * Get or create a Redis client connection.
 * Returns null if REDIS_URL is not configured (graceful degradation).
 */
export function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!redis) {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
      enableReadyCheck: true,
    });

    redis.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected");
    });

    redis.on("reconnecting", () => {
      console.log("[Redis] Reconnecting...");
    });
  }

  return redis;
}

/**
 * Connect to Redis (call on server startup).
 */
export async function connectRedis(): Promise<boolean> {
  const client = getRedis();
  if (!client) {
    console.log("[Redis] REDIS_URL not set. Running without Redis cache.");
    return false;
  }

  try {
    await client.connect();
    const pong = await client.ping();
    if (pong === "PONG") {
      console.log("[Redis] Connection verified (PONG)");
      return true;
    }
  } catch (err: any) {
    console.error("[Redis] Failed to connect:", err.message);
    redis = null;
  }
  return false;
}

/**
 * Disconnect from Redis (call on server shutdown).
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("[Redis] Disconnected");
  }
}

// ─── Cache Helpers ───────────────────────────────────────────────────

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = DEFAULT_TTL,
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // silently fail
  }
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // silently fail
  }
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    // Use SCAN instead of KEYS to avoid blocking Redis
    let cursor = "0";
    const keysToDelete: string[] = [];
    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      keysToDelete.push(...keys);
    } while (cursor !== "0");

    if (keysToDelete.length > 0) {
      // Delete in batches of 100 to avoid huge DEL commands
      for (let i = 0; i < keysToDelete.length; i += 100) {
        const batch = keysToDelete.slice(i, i + 100);
        await client.del(...batch);
      }
    }
  } catch {
    // silently fail
  }
}

// ─── Session Store ───────────────────────────────────────────────────

export async function setSession(
  sessionId: string,
  data: Record<string, unknown>,
  ttlSeconds = 3600,
): Promise<void> {
  const key = `session:${sessionId}`;
  await cacheSet(key, data, ttlSeconds);
}

export async function getSession<T extends Record<string, unknown>>(
  sessionId: string,
): Promise<T | null> {
  const key = `session:${sessionId}`;
  return cacheGet<T>(key);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const key = `session:${sessionId}`;
  await cacheDel(key);
}
