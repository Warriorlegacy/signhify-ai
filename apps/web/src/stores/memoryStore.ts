import { create } from "zustand";
import { fetchApi } from "../lib/api";

export interface MemoryEntry {
  _id: string;
  userId?: string;
  key?: string;
  value?: string;
  title?: string;
  content?: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

interface MemoryState {
  entries: MemoryEntry[];
  isLoading: boolean;
  searchQuery: string;
  loadMemory: () => Promise<void>;
  addEntry: (key: string, value: string, tags?: string[]) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setSearch: (q: string) => void;
  filteredEntries: () => MemoryEntry[];
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  entries: [],
  isLoading: false,
  searchQuery: "",

  loadMemory: async () => {
    set({ isLoading: true });
    try {
      const notes = await fetchApi<MemoryEntry[]>("/notes");
      set({ entries: notes, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addEntry: async (key, value, tags = []) => {
    try {
      const note = await fetchApi<MemoryEntry>("/notes", {
        method: "POST",
        body: JSON.stringify({ title: key, content: value, tags }),
      });
      set((s) => ({ entries: [note, ...s.entries] }));
    } catch (err) {
      console.error("Failed to save memory entry", err);
    }
  },

  deleteEntry: async (id) => {
    try {
      await fetchApi(`/notes/${id}`, { method: "DELETE" });
      set((s) => ({ entries: s.entries.filter((e) => e._id !== id) }));
    } catch (err) {
      console.error("Failed to delete memory entry", err);
    }
  },

  setSearch: (q) => set({ searchQuery: q }),

  filteredEntries: () => {
    const { entries, searchQuery } = get();
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        (e.key ?? e.title ?? "")?.toLowerCase().includes(q) ||
        (e.value ?? e.content ?? "")?.toLowerCase().includes(q) ||
        (e.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  },
}));
