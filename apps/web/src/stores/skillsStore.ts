import { create } from "zustand";
import { fetchApi } from "../lib/api";

export interface Skill {
  _id: string;
  userId?: string;
  name: string;
  description: string;
  agentType: string;
  promptTemplate: string;
  examples: Array<{ input: string; output: string }>;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface SkillsState {
  skills: Skill[];
  suggestedSkills: Omit<Skill, "_id" | "usageCount" | "createdAt">[];
  isLoading: boolean;
  searchQuery: string;
  loadSkills: () => Promise<void>;
  addSkill: (skill: Omit<Skill, "_id" | "usageCount" | "createdAt">) => Promise<Skill>;
  addSuggestedSkill: (skill: Omit<Skill, "_id" | "usageCount" | "createdAt">) => void;
  removeSuggestedSkill: (name: string) => void;
  deleteSkill: (id: string) => Promise<void>;
  useSkill: (id: string) => Promise<void>;
  setSearch: (q: string) => void;
  filteredSkills: () => Skill[];
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  skills: [],
  suggestedSkills: [],
  isLoading: false,
  searchQuery: "",

  addSuggestedSkill: (skill) => {
    // Avoid duplicates by name
    const exists = get().suggestedSkills.some((s) => s.name === skill.name);
    const alreadySaved = get().skills.some((s) => s.name === skill.name);
    if (!exists && !alreadySaved) {
      set((s) => ({ suggestedSkills: [skill, ...s.suggestedSkills] }));
    }
  },

  removeSuggestedSkill: (name) => {
    set((s) => ({ suggestedSkills: s.suggestedSkills.filter((sk) => sk.name !== name) }));
  },

  loadSkills: async () => {
    set({ isLoading: true });
    try {
      const skills = await fetchApi<Skill[]>("/skills");
      set({ skills, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addSkill: async (newSkill) => {
    try {
      const skill = await fetchApi<Skill>("/skills", {
        method: "POST",
        body: JSON.stringify(newSkill),
      });
      set((s) => ({ skills: [skill, ...s.skills] }));
      return skill;
    } catch (err) {
      console.error("Failed to save skill", err);
      throw err;
    }
  },

  deleteSkill: async (id) => {
    try {
      await fetchApi(`/skills/${id}`, { method: "DELETE" });
      set((s) => ({ skills: s.skills.filter((e) => e._id !== id) }));
    } catch (err) {
      console.error("Failed to delete skill", err);
    }
  },

  useSkill: async (id) => {
    try {
      await fetchApi(`/skills/${id}/use`, { method: "POST" });
      set((s) => ({
        skills: s.skills.map((sk) =>
          sk._id === id ? { ...sk, usageCount: sk.usageCount + 1 } : sk
        ),
      }));
    } catch (err) {
      console.error("Failed to increment skill usage", err);
    }
  },

  setSearch: (q) => set({ searchQuery: q }),

  filteredSkills: () => {
    const { skills, searchQuery } = get();
    if (!searchQuery) return skills;
    const q = searchQuery.toLowerCase();
    return skills.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.agentType.toLowerCase().includes(q) ||
        (e.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  },
}));
