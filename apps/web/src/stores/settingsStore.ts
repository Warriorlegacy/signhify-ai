import { create } from "zustand";
import { KeyVault, UserKeys } from "../lib/keyVault";

const MODEL_KEY = "signhify_preferred_model";

interface SettingsState {
  keys: UserKeys;
  hasKeys: boolean;
  activeProvider: string;
  preferredModel: string;
  loadKeys: () => void;
  saveKeys: (keys: UserKeys) => void;
  clearKeys: () => void;
  setPreferredModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  keys: {},
  hasKeys: false,
  activeProvider: "None",
  preferredModel: localStorage.getItem(MODEL_KEY) ?? "auto",
  loadKeys: () => {
    const keys = KeyVault.load();
    set({
      keys,
      hasKeys: KeyVault.hasKeys(),
      activeProvider: KeyVault.getActiveProvider(),
    });
  },
  saveKeys: (keys) => {
    KeyVault.save(keys);
    set({
      keys,
      hasKeys: KeyVault.hasKeys(),
      activeProvider: KeyVault.getActiveProvider(),
    });
  },
  clearKeys: () => {
    KeyVault.clear();
    set({ keys: {}, hasKeys: false, activeProvider: "None" });
  },
  setPreferredModel: (model) => {
    localStorage.setItem(MODEL_KEY, model);
    set({ preferredModel: model });
  },
}));
