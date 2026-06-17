export interface MemoryEntry {
  id: string;
  userId: string;
  key: string;
  value: string;
  timestamp: Date;
}

export class MemoryStore {
  private store = new Map<string, Map<string, MemoryEntry>>();

  private userMap(userId: string): Map<string, MemoryEntry> {
    if (!this.store.has(userId)) {
      this.store.set(userId, new Map());
    }
    return this.store.get(userId)!;
  }

  get(userId: string, key: string): MemoryEntry | undefined {
    return this.userMap(userId).get(key);
  }

  set(userId: string, key: string, value: string): void {
    this.userMap(userId).set(key, {
      id: crypto.randomUUID(),
      userId,
      key,
      value,
      timestamp: new Date(),
    });
  }

  delete(userId: string, key: string): void {
    this.userMap(userId).delete(key);
  }

  list(userId: string): MemoryEntry[] {
    return Array.from(this.userMap(userId).values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  clear(userId: string): void {
    this.store.delete(userId);
  }

  search(userId: string, query: string): MemoryEntry[] {
    const q = query.toLowerCase();
    return this.list(userId).filter(
      (e) =>
        e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q),
    );
  }
}

export const globalMemoryStore = new MemoryStore();
