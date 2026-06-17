import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import {
  setMemory,
  getMemory,
  deleteMemory,
  listMemory,
  clearUserMemory,
  MemoryEntry,
} from "../index";

describe("Memory Store (functional)", () => {
  const userId = "test-user";

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearUserMemory(userId);
    vi.useRealTimers();
  });

  it("should store and retrieve a value", () => {
    setMemory(userId, "preferred_model", "gemini-flash");
    const entry = getMemory(userId, "preferred_model");
    expect(entry).toBeDefined();
    expect(entry!.key).toBe("preferred_model");
    expect(entry!.value).toBe("gemini-flash");
    expect(entry!.userId).toBe(userId);
  });

  it("should return undefined for missing key", () => {
    const entry = getMemory(userId, "nonexistent");
    expect(entry).toBeUndefined();
  });

  it("should overwrite existing value", () => {
    setMemory(userId, "key", "value1");
    setMemory(userId, "key", "value2");
    expect(getMemory(userId, "key")!.value).toBe("value2");
  });

  it("should delete a key", () => {
    setMemory(userId, "temp", "data");
    deleteMemory(userId, "temp");
    expect(getMemory(userId, "temp")).toBeUndefined();
  });

  it("should list all entries sorted by recency", () => {
    setMemory(userId, "a", "first");
    vi.advanceTimersByTime(1);
    setMemory(userId, "b", "second");
    vi.advanceTimersByTime(1);
    setMemory(userId, "c", "third");
    const list = listMemory(userId);
    expect(list).toHaveLength(3);
    expect(list[0].key).toBe("c");
  });

  it("should clear all entries for a user", () => {
    setMemory(userId, "x", "1");
    setMemory(userId, "y", "2");
    clearUserMemory(userId);
    expect(listMemory(userId)).toHaveLength(0);
  });
});
