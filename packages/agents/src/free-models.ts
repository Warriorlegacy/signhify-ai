import type { ProviderId, FreeModelEntry } from "@signhify/types";

/**
 * Curated registry of verified free-tier models across all providers.
 * Priority: lower number = tried first.
 * Signhify uses this to automatically route through free models before
 * falling back to paid options.
 */
export const FREE_MODELS: FreeModelEntry[] = [
  // Priority 1-2: Groq (fastest inference, generous free tier)
  {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    label: "Groq Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 1,
  },
  {
    provider: "groq",
    model: "gemma2-9b-it",
    label: "Groq Gemma 2 9B",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 2,
  },

  // Priority 3: Cerebras (very fast inference)
  {
    provider: "cerebras",
    model: "llama3.1-8b",
    label: "Cerebras Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 3,
  },

  // Priority 4: SambaNova
  {
    provider: "sambanova",
    model: "Meta-Llama-3.1-8B-Instruct",
    label: "SambaNova Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 20,
    priority: 4,
  },

  // Priority 5: Together AI
  {
    provider: "together",
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    label: "Together Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 20,
    priority: 5,
  },

  // Priority 6: Mistral
  {
    provider: "mistral",
    model: "open-mistral-nemo",
    label: "Mistral Nemo",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 6,
  },

  // Priority 7: Gemini (always available, solid fallback)
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    maxTokens: 8192,
    requestsPerMin: 15,
    priority: 7,
  },

  // Priority 8: OpenRouter free models
  {
    provider: "openrouter",
    model: "meta-llama/llama-3.1-8b-instruct:free",
    label: "OpenRouter Llama 3.1 8B (Free)",
    maxTokens: 4096,
    requestsPerMin: 10,
    priority: 8,
  },

  // Priority 9: Cloudflare Workers AI
  {
    provider: "cloudflare",
    model: "@cf/meta/llama-3.1-8b-instruct",
    label: "Cloudflare Llama 3.1 8B",
    maxTokens: 4096,
    requestsPerMin: 10,
    priority: 9,
  },
];

/**
 * Paid/fallback models for each provider, used when free models are exhausted.
 */
export const PAID_MODELS: Record<
  ProviderId,
  { model: string; label: string }[]
> = {
  groq: [
    { model: "llama-3.3-70b-versatile", label: "Groq Llama 3.3 70B" },
    { model: "deepseek-coder-v2", label: "Groq DeepSeek Coder V2" },
  ],
  openai: [
    { model: "gpt-4o", label: "GPT-4o" },
    { model: "gpt-4o-mini", label: "GPT-4o Mini" },
    { model: "o1-preview", label: "o1 Preview" },
  ],
  anthropic: [
    { model: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { model: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  ],
  openrouter: [
    { model: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (OR)" },
    { model: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B (OR)" },
  ],
  gemini: [
    { model: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { model: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
  mistral: [
    { model: "mistral-large-latest", label: "Mistral Large" },
    { model: "mistral-medium-latest", label: "Mistral Medium" },
  ],
  together: [
    {
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      label: "Llama 3.1 70B (Together)",
    },
    {
      model: "Qwen/Qwen2.5-72B-Instruct-Turbo",
      label: "Qwen 2.5 72B (Together)",
    },
  ],
  cerebras: [{ model: "llama3.1-70b", label: "Cerebras Llama 3.1 70B" }],
  sambanova: [
    { model: "Meta-Llama-3.1-70B-Instruct", label: "SambaNova Llama 3.1 70B" },
    { model: "DeepSeek-R1-Distill-Llama-70B", label: "SambaNova DeepSeek R1" },
  ],
  cloudflare: [
    {
      model: "@cf/meta/llama-3.1-70b-instruct",
      label: "Cloudflare Llama 3.1 70B",
    },
  ],
  litellm: [{ model: "gpt-4o", label: "LiteLLM GPT-4o" }],
};

/**
 * Returns free models filtered to only those whose provider has an available key.
 */
export function getAvailableFreeModels(
  availableProviders: ProviderId[],
): FreeModelEntry[] {
  return FREE_MODELS.filter((m) =>
    availableProviders.includes(m.provider),
  ).sort((a, b) => a.priority - b.priority);
}
