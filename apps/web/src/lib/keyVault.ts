const STORAGE_KEY = "signhify_keys_v2";
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
  openai?: string;
  anthropic?: string;
  openrouter?: string;
  tavily?: string;
  elevenlabs?: string;
}

export const LLM_PROVIDERS: { key: keyof UserKeys; label: string; placeholder: string; headerKey: string }[] = [
  { key: "gemini", label: "Google Gemini", placeholder: "AIza...", headerKey: "x-gemini-key" },
  { key: "groq", label: "Groq", placeholder: "gsk_...", headerKey: "x-groq-key" },
  { key: "openai", label: "OpenAI", placeholder: "sk-...", headerKey: "x-openai-key" },
  { key: "anthropic", label: "Anthropic", placeholder: "sk-ant-...", headerKey: "x-anthropic-key" },
  { key: "openrouter", label: "OpenRouter", placeholder: "sk-or-...", headerKey: "x-openrouter-key" },
  { key: "tavily", label: "Tavily (Search)", placeholder: "tvly-...", headerKey: "x-tavily-key" },
  { key: "elevenlabs", label: "ElevenLabs (TTS)", placeholder: "sk_...", headerKey: "x-elevenlabs-key" },
];

export const KeyVault = {
  save(keys: UserKeys) {
    localStorage.setItem(STORAGE_KEY, obfuscate(JSON.stringify(keys)));
    // Migrate old storage key if exists
    localStorage.removeItem("signhify_keys_v1");
  },
  load(): UserKeys {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Try migrating from v1
      const oldRaw = localStorage.getItem("signhify_keys_v1");
      if (oldRaw) {
        try {
          return JSON.parse(deobfuscate(oldRaw));
        } catch { return {}; }
      }
      return {};
    }
    try {
      return JSON.parse(deobfuscate(raw));
    } catch {
      return {};
    }
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("signhify_keys_v1");
  },
  toHeaders(): Record<string, string> {
    const keys = this.load();
    const headers: Record<string, string> = {};
    for (const provider of LLM_PROVIDERS) {
      const val = keys[provider.key];
      if (val) headers[provider.headerKey] = val;
    }
    return headers;
  },
  hasKeys(): boolean {
    const keys = this.load();
    return !!(keys.gemini || keys.groq || keys.openai || keys.anthropic || keys.openrouter);
  },
  getActiveProvider(): string {
    const keys = this.load();
    if (keys.groq) return "Groq";
    if (keys.openai) return "OpenAI";
    if (keys.anthropic) return "Anthropic";
    if (keys.openrouter) return "OpenRouter";
    if (keys.gemini) return "Gemini";
    return "None";
  },
};
