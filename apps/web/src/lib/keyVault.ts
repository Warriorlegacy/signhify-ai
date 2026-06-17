const STORAGE_KEY = "signhify_keys_v1";
const SALT = "signhify-salt-2026";

function obfuscate(str: string): string {
  return btoa(
    str
      .split("")
      .map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)),
      )
      .join(""),
  );
}

function deobfuscate(str: string): string {
  return atob(str)
    .split("")
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)),
    )
    .join("");
}

export interface UserKeys {
  gemini?: string;
  groq?: string;
  tavily?: string;
  elevenlabs?: string;
}

export const KeyVault = {
  save(keys: UserKeys) {
    localStorage.setItem(STORAGE_KEY, obfuscate(JSON.stringify(keys)));
  },
  load(): UserKeys {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(deobfuscate(raw));
    } catch {
      return {};
    }
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
  toHeaders(): Record<string, string> {
    const keys = this.load();
    const headers: Record<string, string> = {};
    if (keys.gemini) headers["x-gemini-key"] = keys.gemini;
    if (keys.groq) headers["x-groq-key"] = keys.groq;
    if (keys.tavily) headers["x-tavily-key"] = keys.tavily;
    if (keys.elevenlabs) headers["x-elevenlabs-key"] = keys.elevenlabs;
    return headers;
  },
  hasKeys(): boolean {
    const keys = this.load();
    return !!(keys.gemini || keys.groq);
  },
};
