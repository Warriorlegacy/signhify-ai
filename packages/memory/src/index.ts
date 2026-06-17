export interface MemoryEntry {
  id: string;
  userId: string;
  key: string;
  value: string;
  timestamp: Date;
}

const memoryStore = new Map<string, Map<string, MemoryEntry>>();

function userStore(userId: string): Map<string, MemoryEntry> {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, new Map());
  }
  return memoryStore.get(userId)!;
}

export function getMemory(
  userId: string,
  key: string,
): MemoryEntry | undefined {
  return userStore(userId).get(key);
}

export function setMemory(userId: string, key: string, value: string): void {
  const entry: MemoryEntry = {
    id: crypto.randomUUID(),
    userId,
    key,
    value,
    timestamp: new Date(),
  };
  userStore(userId).set(key, entry);
}

export function deleteMemory(userId: string, key: string): void {
  userStore(userId).delete(key);
}

export function listMemory(userId: string): MemoryEntry[] {
  return Array.from(userStore(userId).values()).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}

export function clearUserMemory(userId: string): void {
  memoryStore.delete(userId);
}

export function searchMemory(userId: string, query: string): MemoryEntry[] {
  const q = query.toLowerCase();
  return listMemory(userId).filter(
    (e) => e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q),
  );
}

export { MemoryStore, globalMemoryStore } from "./store";
export { computeEmbedding, cosineSimilarity } from "./embeddings";
