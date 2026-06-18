import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { getRedis } from "../lib/redis";

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests = 100, windowMs = 60000) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = req.userId ?? req.ip ?? "unknown";
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);
    const redisKey = `ratelimit:${key}`;

    const client = getRedis();
    if (client) {
      // Redis-backed rate limiting
      try {
        const result = await client
          .multi()
          .incr(redisKey)
          .pexpire(redisKey, windowMs)
          .pttl(redisKey)
          .exec();

        const count = (result?.[0]?.[1] as number) ?? 1;
        const ttl = (result?.[2]?.[1] as number) ?? windowMs;
        const remaining = Math.max(0, maxRequests - count);

        res.setHeader("X-RateLimit-Limit", maxRequests);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", Math.ceil((now + ttl) / 1000));

        if (count > maxRequests) {
          return res.status(429).json({
            error: "Rate limit exceeded. Try again later.",
            errorCode: "RATE_LIMIT_EXCEEDED",
            statusCode: 429,
            retryAfter: Math.ceil(ttl / 1000),
          });
        }

        return next();
      } catch {
        // Fall through to in-memory on Redis error
      }
    }

    // In-memory fallback (when Redis unavailable)
    const record = inMemoryStore.get(key);
    if (!record || now > record.resetAt) {
      inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return res.status(429).json({
        error: "Rate limit exceeded. Try again later.",
        errorCode: "RATE_LIMIT_EXCEEDED",
        statusCode: 429,
        retryAfter,
      });
    }

    record.count++;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - record.count);
    next();
  };
}

// Cleanup in-memory store periodically (only used when Redis is down)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryStore.entries()) {
    if (now > record.resetAt) inMemoryStore.delete(key);
  }
}, 60000);
