import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

export type ApiKeys = {
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
};

type ModelSpec = "default" | "code" | "quick" | "powerful";

const modelConfigs: Record<ModelSpec, Record<string, string>> = {
  default: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-20241022",
    openrouter: "meta-llama/llama-3.3-70b-instruct",
    mistral: "mistral-small-latest",
    together: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    cerebras: "llama3.1-8b",
    sambanova: "Meta-Llama-3.1-8B-Instruct",
    cloudflare: "@cf/meta/llama-3.1-8b-instruct",
  },
  code: {
    gemini: "gemini-2.0-flash",
    groq: "deepseek-coder-v2",
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    openrouter: "deepseek/deepseek-coder",
    mistral: "mistral-large-latest",
    together: "Qwen/Qwen2.5-72B-Instruct-Turbo",
    cerebras: "llama3.1-70b",
    sambanova: "DeepSeek-R1-Distill-Llama-70B",
    cloudflare: "@cf/meta/llama-3.1-70b-instruct",
  },
  quick: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.1-8b-instant",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-20241022",
    openrouter: "meta-llama/llama-3.1-8b-instruct:free",
    mistral: "open-mistral-nemo",
    together: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    cerebras: "llama3.1-8b",
    sambanova: "Meta-Llama-3.1-8B-Instruct",
    cloudflare: "@cf/meta/llama-3.1-8b-instruct",
  },
  powerful: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    openrouter: "anthropic/claude-3.5-sonnet",
    mistral: "mistral-large-latest",
    together: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    cerebras: "llama3.1-70b",
    sambanova: "Meta-Llama-3.1-70B-Instruct",
    cloudflare: "@cf/meta/llama-3.1-70b-instruct",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LLMModel = any;

interface ProviderEntry {
  name: string;
  model: LLMModel;
  isFree: boolean;
}

/**
 * FallbackModel wraps multiple LLM providers and automatically retries
 * with the next provider when one fails. Tries free models first.
 */
class FallbackModel {
  private providers: ProviderEntry[];
  private failedProviders = new Set<string>();

  constructor(providers: ProviderEntry[]) {
    this.providers = providers;
  }

  async *stream(messages: any[]): AsyncGenerator<any, void, unknown> {
    let lastError: Error | undefined;

    for (const provider of this.providers) {
      if (this.failedProviders.has(provider.name)) continue;

      try {
        const readableStream = await provider.model.stream(messages);
        for await (const chunk of readableStream) {
          yield chunk;
        }
        return;
      } catch (err: any) {
        lastError = err;
        this.failedProviders.add(provider.name);
        console.warn(
          `[FallbackModel] ${provider.name} failed: ${err.message}. Trying next provider...`,
        );
      }
    }

    throw new Error(
      `All LLM providers failed. Last error: ${lastError?.message ?? "No providers available"}`,
    );
  }

  getProviderNames(): string[] {
    return this.providers.map((p) => p.name);
  }
}

/**
 * Builds a free-first provider chain from available API keys.
 * Free models are tried before paid models.
 */
function buildProviderChain(
  apiKeys: ApiKeys,
  spec: ModelSpec,
): ProviderEntry[] {
  const models = modelConfigs[spec];
  const chain: ProviderEntry[] = [];

  // Free-first: Groq (fastest free tier)
  if (apiKeys.groq) {
    chain.push({
      name: "groq",
      model: new ChatGroq({
        model: models.groq,
        apiKey: apiKeys.groq,
        streaming: true,
      }),
      isFree: true,
    });
  }

  // Free: Cerebras
  if (apiKeys.cerebras) {
    chain.push({
      name: "cerebras",
      model: new ChatOpenAI({
        model: models.cerebras,
        apiKey: apiKeys.cerebras,
        streaming: true,
        configuration: { baseURL: "https://api.cerebras.ai/v1" },
      } as any),
      isFree: true,
    });
  }

  // Free: SambaNova
  if (apiKeys.sambanova) {
    chain.push({
      name: "sambanova",
      model: new ChatOpenAI({
        model: models.sambanova,
        apiKey: apiKeys.sambanova,
        streaming: true,
        configuration: { baseURL: "https://api.sambanova.ai/v1" },
      } as any),
      isFree: true,
    });
  }

  // Free: Together AI
  if (apiKeys.together) {
    chain.push({
      name: "together",
      model: new ChatOpenAI({
        model: models.together,
        apiKey: apiKeys.together,
        streaming: true,
        configuration: { baseURL: "https://api.together.xyz/v1" },
      } as any),
      isFree: true,
    });
  }

  // Free: Mistral
  if (apiKeys.mistral) {
    chain.push({
      name: "mistral",
      model: new ChatOpenAI({
        model: models.mistral,
        apiKey: apiKeys.mistral,
        streaming: true,
        configuration: { baseURL: "https://api.mistral.ai/v1" },
      } as any),
      isFree: true,
    });
  }

  // Free: Gemini
  if (apiKeys.gemini) {
    chain.push({
      name: "gemini",
      model: new ChatGoogleGenerativeAI({
        model: models.gemini,
        apiKey: apiKeys.gemini,
        streaming: true,
      }),
      isFree: true,
    });
  }

  // Free: OpenRouter free models
  if (apiKeys.openrouter) {
    chain.push({
      name: "openrouter",
      model: new ChatOpenAI({
        model: models.openrouter,
        apiKey: apiKeys.openrouter,
        streaming: true,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer": "https://signhify.ai",
            "X-Title": "Signhify AI",
          },
        },
      }),
      isFree: true,
    });
  }

  // Paid fallbacks (only if not already added as free)
  if (apiKeys.openai && !chain.some((p) => p.name === "openai")) {
    chain.push({
      name: "openai",
      model: new ChatOpenAI({
        model: models.openai,
        apiKey: apiKeys.openai,
        streaming: true,
      }),
      isFree: false,
    });
  }

  if (apiKeys.anthropic && !chain.some((p) => p.name === "anthropic")) {
    chain.push({
      name: "anthropic",
      model: new ChatAnthropic({
        model: models.anthropic,
        apiKey: apiKeys.anthropic,
        streaming: true,
      }),
      isFree: false,
    });
  }

  return chain;
}

/**
 * Creates an LLM with automatic multi-provider fallback.
 * Free models are tried first, then paid models as fallback.
 */
export function createLLM(apiKeys: ApiKeys, spec: ModelSpec = "default"): any {
  const chain = buildProviderChain(apiKeys, spec);

  if (chain.length === 0) {
    throw new Error(
      "No LLM providers available. Add at least one API key in Settings.",
    );
  }

  if (chain.length === 1) return chain[0].model;

  return new FallbackModel(chain);
}

export function getProviderName(apiKeys: ApiKeys): string {
  if (apiKeys.groq) return "Groq";
  if (apiKeys.cerebras) return "Cerebras";
  if (apiKeys.sambanova) return "SambaNova";
  if (apiKeys.together) return "Together AI";
  if (apiKeys.mistral) return "Mistral";
  if (apiKeys.openai) return "OpenAI";
  if (apiKeys.anthropic) return "Anthropic";
  if (apiKeys.openrouter) return "OpenRouter";
  return "Gemini";
}

export async function streamResponse(
  model: any,
  messages: Array<{ role: string; content: string }>,
  onToken: (token: string) => void,
): Promise<string> {
  let stream: AsyncIterable<any>;

  if (model instanceof FallbackModel) {
    stream = model.stream(messages as any);
  } else if (typeof model.stream === "function") {
    stream = await model.stream(messages as any);
  } else {
    throw new Error("Model does not support streaming");
  }

  let fullResponse = "";
  for await (const chunk of stream) {
    const token = chunk.content as string;
    if (token) {
      onToken(token);
      fullResponse += token;
    }
  }
  return fullResponse;
}

export async function runAgentWithStreaming(
  model: any,
  systemPrompt: string,
  userMessage: string,
  onToken: (token: string) => void,
): Promise<string> {
  return streamResponse(
    model,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    onToken,
  );
}
