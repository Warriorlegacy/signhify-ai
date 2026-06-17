import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

const rateStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = req.userId ?? req.ip ?? "unknown";
    const now = Date.now();
    const record = rateStore.get(key);

    if (!record || now > record.resetAt) {
      rateStore.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: "Rate limit exceeded. Try again later.",
        errorCode: "RATE_LIMIT_EXCEEDED",
        statusCode: 429,
      });
    }

    record.count++;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - record.count);
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateStore.entries()) {
    if (now > record.resetAt) rateStore.delete(key);
  }
}, 60000);
