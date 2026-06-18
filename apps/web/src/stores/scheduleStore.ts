import { create } from "zustand";
import { fetchApi } from "../lib/api";

export interface ScheduledTask {
  _id: string;
  name: string;
  description?: string;
  cronExpression: string;
  prompt: string;
  agentType?: string;
  enabled: boolean;
  lastRun?: string;
  lastResult?: string;
  nextRun?: string;
  runCount: number;
  createdAt: string;
}

interface ScheduleState {
  tasks: ScheduledTask[];
  isLoading: boolean;
  loadTasks: () => Promise<void>;
  createTask: (task: Partial<ScheduledTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  tasks: [],
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await fetchApi<ScheduledTask[]>("/schedule");
      set({ tasks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createTask: async (task) => {
    try {
      const created = await fetchApi<ScheduledTask>("/schedule", {
        method: "POST",
        body: JSON.stringify(task),
      });
      set((s) => ({ tasks: [created, ...s.tasks] }));
    } catch (err) {
      console.error("Failed to create task", err);
    }
  },

  deleteTask: async (id) => {
    try {
      await fetchApi(`/schedule/${id}`, { method: "DELETE" });
      set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  },

  toggleTask: async (id) => {
    try {
      const result = await fetchApi<{ enabled: boolean }>(`/schedule/${id}/toggle`, {
        method: "POST",
      });
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t._id === id ? { ...t, enabled: result.enabled } : t
        ),
      }));
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  },
}));
