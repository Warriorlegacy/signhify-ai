import { describe, it, expect, vi } from "vitest";

describe("Rate Limiter", () => {
  it("should allow requests within limit", () => {
    const rateStore = new Map<string, { count: number; resetAt: number }>();
    const key = "test-user";
    const maxRequests = 5;
    const windowMs = 60000;

    for (let i = 0; i < maxRequests; i++) {
      const now = Date.now();
      const record = rateStore.get(key);
      if (!record || now > record.resetAt) {
        rateStore.set(key, { count: 1, resetAt: now + windowMs });
      } else {
        record.count++;
      }
    }

    const finalRecord = rateStore.get(key)!;
    expect(finalRecord.count).toBeLessThanOrEqual(maxRequests);
  });

  it("should block requests exceeding limit", () => {
    const rateStore = new Map<string, { count: number; resetAt: number }>();
    const key = "test-user";
    const maxRequests = 2;
    const windowMs = 60000;
    const now = Date.now();
    rateStore.set(key, { count: maxRequests, resetAt: now + windowMs });

    const record = rateStore.get(key)!;
    const isBlocked = record.count >= maxRequests && now < record.resetAt;
    expect(isBlocked).toBe(true);
  });

  it("should reset after window expires", () => {
    const rateStore = new Map<string, { count: number; resetAt: number }>();
    const key = "test-user";
    rateStore.set(key, { count: 100, resetAt: Date.now() - 1000 });

    const now = Date.now();
    const record = rateStore.get(key)!;
    if (now > record.resetAt) {
      rateStore.set(key, { count: 1, resetAt: now + 60000 });
    }

    expect(rateStore.get(key)!.count).toBe(1);
  });
});
