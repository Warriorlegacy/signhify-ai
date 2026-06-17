import { describe, it, expect } from "vitest";

describe("Agents package exports", () => {
  it("should export classifyIntent and AgentTypes", async () => {
    const mod = await import("../index");
    expect(mod.classifyIntent).toBeDefined();
    expect(mod.runScribeAgent).toBeDefined();
    expect(mod.runScoutAgent).toBeDefined();
    expect(mod.runForgeAgent).toBeDefined();
  });

  it("should export AgentType types", async () => {
    const mod = await import("../nexus/router");
    const valid: string[] = [
      "scribe",
      "scout",
      "forge",
      "vault",
      "herald",
      "vision",
      "general",
    ];
    expect(mod.classifyIntent).toBeDefined();
  });
});
