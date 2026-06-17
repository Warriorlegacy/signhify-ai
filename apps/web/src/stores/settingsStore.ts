import { create } from "zustand";
import { KeyVault, UserKeys } from "../lib/keyVault";

const MODEL_KEY = "signhify_preferred_model";

interface SettingsState {
  keys: UserKeys;
  hasKeys: boolean;
  preferredModel: string;
  loadKeys: () => void;
  saveKeys: (keys: UserKeys) => void;
  clearKeys: () => void;
  setPreferredModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  keys: {},
  hasKeys: false,
  preferredModel: localStorage.getItem(MODEL_KEY) ?? "gemini-flash",
  loadKeys: () => {
    const keys = KeyVault.load();
    set({ keys, hasKeys: KeyVault.hasKeys() });
  },
  saveKeys: (keys) => {
    KeyVault.save(keys);
    set({ keys, hasKeys: true });
  },
  clearKeys: () => {
    KeyVault.clear();
    set({ keys: {}, hasKeys: false });
  },
  setPreferredModel: (model) => {
    localStorage.setItem(MODEL_KEY, model);
    set({ preferredModel: model });
  },
}));
