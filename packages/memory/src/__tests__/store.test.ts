import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStore } from "../store";

describe("MemoryStore class", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it("should set and get values", () => {
    store.set("user1", "theme", "dark");
    expect(store.get("user1", "theme")!.value).toBe("dark");
  });

  it("should list entries", () => {
    store.set("user1", "a", "1");
    store.set("user1", "b", "2");
    expect(store.list("user1")).toHaveLength(2);
  });

  it("should delete entries", () => {
    store.set("user1", "temp", "x");
    store.delete("user1", "temp");
    expect(store.get("user1", "temp")).toBeUndefined();
  });

  it("should clear user data", () => {
    store.set("user1", "k", "v");
    store.clear("user1");
    expect(store.list("user1")).toHaveLength(0);
  });

  it("should search by key and value", () => {
    store.set("user1", "preferred_model", "gemini-flash");
    store.set("user1", "language", "typescript");
    const results = store.search("user1", "model");
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe("preferred_model");
  });

  it("should isolate data between users", () => {
    store.set("alice", "key", "alice-data");
    store.set("bob", "key", "bob-data");
    expect(store.get("alice", "key")!.value).toBe("alice-data");
    expect(store.get("bob", "key")!.value).toBe("bob-data");
  });
});
