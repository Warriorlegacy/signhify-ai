import { create } from "zustand";
import { fetchApi } from "../lib/api";

interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentId?: string;
}

interface Thread {
  _id: string;
  title: string;
  messages: Message[];
  agentsInvoked: string[];
  createdAt: string;
  updatedAt: string;
}

interface ThreadState {
  threads: Thread[];
  activeThread: Thread | null;
  isLoading: boolean;
  loadThreads: () => Promise<void>;
  setActiveThread: (thread: Thread | null) => void;
  createThread: (title?: string, message?: string) => Promise<Thread>;
  deleteThread: (id: string) => Promise<void>;
}

export const useThreadStore = create<ThreadState>((set, get) => ({
  threads: [],
  activeThread: null,
  isLoading: false,
  loadThreads: async () => {
    set({ isLoading: true });
    try {
      const threads = await fetchApi<Thread[]>("/threads");
      set({ threads, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  setActiveThread: (thread) => set({ activeThread: thread }),
  createThread: async (title, message) => {
    const thread = await fetchApi<Thread>("/threads", {
      method: "POST",
      body: JSON.stringify({ title, message }),
    });
    set((s) => ({ threads: [thread, ...s.threads], activeThread: thread }));
    return thread;
  },
  deleteThread: async (id) => {
    await fetchApi(`/threads/${id}`, { method: "DELETE" });
    set((s) => ({
      threads: s.threads.filter((t) => t._id !== id),
      activeThread: s.activeThread?._id === id ? null : s.activeThread,
    }));
  },
}));
