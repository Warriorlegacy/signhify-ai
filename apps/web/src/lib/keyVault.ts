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
  mistral?: string;
  together?: string;
  cerebras?: string;
  sambanova?: string;
  cloudflare?: string;
  cloudflareAccountId?: string;
  tavily?: string;
  elevenlabs?: string;
}

export const LLM_PROVIDERS: {
  key: keyof UserKeys;
  label: string;
  placeholder: string;
  headerKey: string;
  isFree?: boolean;
}[] = [
  {
    key: "groq",
    label: "Groq",
    placeholder: "gsk_...",
    headerKey: "x-groq-key",
    isFree: true,
  },
  {
    key: "cerebras",
    label: "Cerebras",
    placeholder: "csk-...",
    headerKey: "x-cerebras-key",
    isFree: true,
  },
  {
    key: "sambanova",
    label: "SambaNova",
    placeholder: "...",
    headerKey: "x-sambanova-key",
    isFree: true,
  },
  {
    key: "together",
    label: "Together AI",
    placeholder: "...",
    headerKey: "x-together-key",
    isFree: true,
  },
  {
    key: "mistral",
    label: "Mistral AI",
    placeholder: "...",
    headerKey: "x-mistral-key",
    isFree: true,
  },
  {
    key: "gemini",
    label: "Google Gemini",
    placeholder: "AIza...",
    headerKey: "x-gemini-key",
    isFree: true,
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    placeholder: "sk-or-...",
    headerKey: "x-openrouter-key",
    isFree: true,
  },
  {
    key: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    headerKey: "x-openai-key",
  },
  {
    key: "anthropic",
    label: "Anthropic",
    placeholder: "sk-ant-...",
    headerKey: "x-anthropic-key",
  },
  {
    key: "cloudflare",
    label: "Cloudflare Workers AI",
    placeholder: "API Token...",
    headerKey: "x-cloudflare-key",
    isFree: true,
  },
  {
    key: "tavily",
    label: "Tavily (Search)",
    placeholder: "tvly-...",
    headerKey: "x-tavily-key",
  },
  {
    key: "elevenlabs",
    label: "ElevenLabs (TTS)",
    placeholder: "sk_...",
    headerKey: "x-elevenlabs-key",
  },
];

export const CLOUDFLARE_ACCOUNT_HEADER = "x-cloudflare-account-id";

export const KeyVault = {
  save(keys: UserKeys) {
    localStorage.setItem(STORAGE_KEY, obfuscate(JSON.stringify(keys)));
    localStorage.removeItem("signhify_keys_v1");
  },
  load(): UserKeys {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const oldRaw = localStorage.getItem("signhify_keys_v1");
      if (oldRaw) {
        try {
          return JSON.parse(deobfuscate(oldRaw));
        } catch {
          return {};
        }
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
    if (keys.cloudflareAccountId) {
      headers[CLOUDFLARE_ACCOUNT_HEADER] = keys.cloudflareAccountId;
    }
    return headers;
  },
  hasKeys(): boolean {
    const keys = this.load();
    return !!(
      keys.gemini ||
      keys.groq ||
      keys.openai ||
      keys.anthropic ||
      keys.openrouter ||
      keys.mistral ||
      keys.together ||
      keys.cerebras ||
      keys.sambanova ||
      keys.cloudflare
    );
  },
  getActiveProvider(): string {
    const keys = this.load();
    if (keys.groq) return "Groq";
    if (keys.cerebras) return "Cerebras";
    if (keys.sambanova) return "SambaNova";
    if (keys.together) return "Together AI";
    if (keys.mistral) return "Mistral";
    if (keys.gemini) return "Gemini";
    if (keys.openai) return "OpenAI";
    if (keys.anthropic) return "Anthropic";
    if (keys.openrouter) return "OpenRouter";
    if (keys.cloudflare) return "Cloudflare";
    return "None";
  },
  getFreeProviders(): string[] {
    const keys = this.load();
    const free: string[] = [];
    if (keys.groq) free.push("Groq");
    if (keys.cerebras) free.push("Cerebras");
    if (keys.sambanova) free.push("SambaNova");
    if (keys.together) free.push("Together AI");
    if (keys.mistral) free.push("Mistral");
    if (keys.gemini) free.push("Gemini");
    if (keys.openrouter) free.push("OpenRouter");
    if (keys.cloudflare) free.push("Cloudflare");
    return free;
  },
};
