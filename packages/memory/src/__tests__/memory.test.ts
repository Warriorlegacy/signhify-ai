import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { MemoryStore } from "../store";

describe("Memory Store (class-based)", () => {
  let store: MemoryStore;
  const userId = "test-user";

  beforeEach(() => {
    store = new MemoryStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    store.clear(userId);
    vi.useRealTimers();
  });

  it("should store and retrieve a value", () => {
    store.set(userId, "preferred_model", "gemini-flash");
    const entry = store.get(userId, "preferred_model");
    expect(entry).toBeDefined();
    expect(entry!.key).toBe("preferred_model");
    expect(entry!.value).toBe("gemini-flash");
    expect(entry!.userId).toBe(userId);
  });

  it("should return undefined for missing key", () => {
    const entry = store.get(userId, "nonexistent");
    expect(entry).toBeUndefined();
  });

  it("should overwrite existing value", () => {
    store.set(userId, "key", "value1");
    store.set(userId, "key", "value2");
    expect(store.get(userId, "key")!.value).toBe("value2");
  });

  it("should delete a key", () => {
    store.set(userId, "temp", "data");
    store.delete(userId, "temp");
    expect(store.get(userId, "temp")).toBeUndefined();
  });

  it("should list all entries sorted by recency", () => {
    store.set(userId, "a", "first");
    vi.advanceTimersByTime(1);
    store.set(userId, "b", "second");
    vi.advanceTimersByTime(1);
    store.set(userId, "c", "third");
    const list = store.list(userId);
    expect(list).toHaveLength(3);
    expect(list[0].key).toBe("c");
  });

  it("should clear all entries for a user", () => {
    store.set(userId, "x", "1");
    store.set(userId, "y", "2");
    store.clear(userId);
    expect(store.list(userId)).toHaveLength(0);
  });

  it("should isolate data between users", () => {
    store.set("alice", "key", "alice-data");
    store.set("bob", "key", "bob-data");
    expect(store.get("alice", "key")!.value).toBe("alice-data");
    expect(store.get("bob", "key")!.value).toBe("bob-data");
  });
});
