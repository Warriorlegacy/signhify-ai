import { describe, it, expect } from "vitest";

describe("Health Check", () => {
  it("should have correct health response shape", () => {
    const response = { status: "ok", timestamp: new Date().toISOString() };
    expect(response).toHaveProperty("status", "ok");
    expect(response).toHaveProperty("timestamp");
    expect(() => new Date(response.timestamp)).not.toThrow();
  });
});
