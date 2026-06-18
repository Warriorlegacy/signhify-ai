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
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: (token, user) => {
    localStorage.setItem("signhify_token", token);
    localStorage.setItem("signhify_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("signhify_token");
    localStorage.removeItem("signhify_user");
    // Also clear refresh cookie via API
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(
      () => {},
    );
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    const token = localStorage.getItem("signhify_token");
    if (!token) return;

    // Try to restore user from localStorage cache first
    const cachedUser = localStorage.getItem("signhify_user");
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser) as User;
        set({ token, user, isAuthenticated: true });
      } catch {
        // Cached user is corrupted, try to fetch from API
      }
    }

    // Verify token and fetch fresh user data from API
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem("signhify_user", JSON.stringify(user));
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else if (res.status === 401) {
        // Token expired — try refresh
        const refreshed = await get().refreshToken();
        if (!refreshed) {
          get().logout();
        }
        set({ isLoading: false });
      } else {
        // If we have a cached user, keep using it
        if (!cachedUser) {
          set({ token, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      }
    } catch {
      // Network error — use cached data if available
      if (cachedUser) {
        set({ isLoading: false });
      } else {
        set({ token, isAuthenticated: true, isLoading: false });
      }
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem("signhify_token", token);
        set({ token });
        return true;
      }
    } catch {
      // Refresh failed
    }
    return false;
  },
}));
