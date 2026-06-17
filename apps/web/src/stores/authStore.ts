import { create } from "zustand";

interface User {
  id: string;
  email: string;
  displayName: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (token, user) => {
    localStorage.setItem("signhify_token", token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("signhify_token");
    set({ token: null, user: null, isAuthenticated: false });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem("signhify_token");
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
