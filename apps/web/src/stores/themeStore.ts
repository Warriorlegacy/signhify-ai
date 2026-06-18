import { create } from "zustand";

export type ThemeId =
  | "cyber"
  | "midnight"
  | "ember"
  | "mono"
  | "aurora"
  | "rose";

interface Theme {
  id: ThemeId;
  name: string;
  accent: string;
  accentDim: string;
  surface: string;
  surface2: string;
  border: string;
  glow: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  cyber: {
    id: "cyber",
    name: "Cyber Teal",
    accent: "#00e5ff",
    accentDim: "#00b8cc",
    surface: "rgba(11, 11, 17, 0.85)",
    surface2: "rgba(17, 17, 24, 0.8)",
    border: "rgba(30, 30, 46, 0.7)",
    glow: "rgba(0, 229, 255, 0.15)",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    accent: "#818cf8",
    accentDim: "#6366f1",
    surface: "rgba(10, 10, 18, 0.9)",
    surface2: "rgba(15, 15, 25, 0.85)",
    border: "rgba(25, 25, 45, 0.7)",
    glow: "rgba(129, 140, 248, 0.12)",
  },
  ember: {
    id: "ember",
    name: "Ember",
    accent: "#f97316",
    accentDim: "#ea580c",
    surface: "rgba(15, 10, 8, 0.9)",
    surface2: "rgba(20, 14, 10, 0.85)",
    border: "rgba(40, 25, 18, 0.7)",
    glow: "rgba(249, 115, 22, 0.12)",
  },
  mono: {
    id: "mono",
    name: "Monochrome",
    accent: "#a1a1aa",
    accentDim: "#71717a",
    surface: "rgba(12, 12, 12, 0.9)",
    surface2: "rgba(18, 18, 18, 0.85)",
    border: "rgba(35, 35, 35, 0.7)",
    glow: "rgba(161, 161, 170, 0.08)",
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    accent: "#34d399",
    accentDim: "#10b981",
    surface: "rgba(8, 14, 12, 0.9)",
    surface2: "rgba(12, 20, 16, 0.85)",
    border: "rgba(20, 35, 28, 0.7)",
    glow: "rgba(52, 211, 153, 0.12)",
  },
  rose: {
    id: "rose",
    name: "Rose",
    accent: "#fb7185",
    accentDim: "#f43f5e",
    surface: "rgba(15, 10, 12, 0.9)",
    surface2: "rgba(22, 14, 17, 0.85)",
    border: "rgba(38, 22, 28, 0.7)",
    glow: "rgba(251, 113, 133, 0.12)",
  },
};

interface ThemeState {
  currentTheme: ThemeId;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
  loadTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: "cyber",
  theme: THEMES.cyber,
  setTheme: (id) => {
    localStorage.setItem("signhify_theme", id);
    set({ currentTheme: id, theme: THEMES[id] });
  },
  loadTheme: () => {
    const saved = localStorage.getItem("signhify_theme") as ThemeId | null;
    if (saved && THEMES[saved]) {
      set({ currentTheme: saved, theme: THEMES[saved] });
    }
  },
}));
