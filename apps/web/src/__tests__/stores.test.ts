import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";

describe("AuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it("should start unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it("should set token and user on login", () => {
    const { login } = useAuthStore.getState();
    login("test-token", {
      id: "1",
      email: "test@test.com",
      displayName: "Test",
      plan: "free",
    });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe("test-token");
    expect(state.user?.email).toBe("test@test.com");
  });

  it("should clear state on logout", () => {
    const { login, logout } = useAuthStore.getState();
    login("token", {
      id: "1",
      email: "a@b.com",
      displayName: "A",
      plan: "free",
    });
    logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });

  it("should load token from localStorage", async () => {
    localStorage.setItem("signhify_token", "stored-token");
    const { loadFromStorage } = useAuthStore.getState();
    await loadFromStorage();
    const state = useAuthStore.getState();
    expect(state.token).toBe("stored-token");
    expect(state.isAuthenticated).toBe(true);
  });
});

describe("SettingsStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({
      keys: {},
      hasKeys: false,
    });
  });

  it("should start with no keys", () => {
    const state = useSettingsStore.getState();
    expect(state.hasKeys).toBe(false);
    expect(state.keys).toEqual({});
  });

  it("should save keys", () => {
    const { saveKeys } = useSettingsStore.getState();
    saveKeys({ gemini: "gk", groq: "gq" });
    const state = useSettingsStore.getState();
    expect(state.hasKeys).toBe(true);
    expect(state.keys.gemini).toBe("gk");
    expect(state.keys.groq).toBe("gq");
  });

  it("should clear keys", () => {
    const { saveKeys, clearKeys } = useSettingsStore.getState();
    saveKeys({ gemini: "gk" });
    clearKeys();
    const state = useSettingsStore.getState();
    expect(state.hasKeys).toBe(false);
    expect(state.keys).toEqual({});
  });
});
