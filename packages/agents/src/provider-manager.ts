import type {
  ProviderId,
  LLMMessage,
  LLMOptions,
  LLMAdapter,
} from "@signhify/types";
import { OpenAIAdapter } from "./adapters/openai";
import { AnthropicAdapter } from "./adapters/anthropic";
import { GroqAdapter } from "./adapters/groq";
import { OpenRouterAdapter } from "./adapters/openrouter";
import { GeminiAdapter } from "./adapters/gemini";

export type ApiKeys = {
  gemini?: string;
  groq?: string;
  openai?: string;
  anthropic?: string;
  openrouter?: string;
};

export type ModelSpec = "default" | "code" | "quick" | "powerful";

const modelConfigs: Record<ModelSpec, Record<ProviderId, string>> = {
  default: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-20241022",
    openrouter: "meta-llama/llama-3.3-70b-instruct",
    litellm: "gpt-4o-mini",
  },
  code: {
    gemini: "gemini-2.0-flash",
    groq: "deepseek-coder-v2",
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    openrouter: "deepseek/deepseek-coder",
    litellm: "gpt-4o",
  },
  quick: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.1-8b-instant",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-20241022",
    openrouter: "meta-llama/llama-3.1-8b-instruct:free",
    litellm: "gpt-4o-mini",
  },
  powerful: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    openrouter: "anthropic/claude-3.5-sonnet",
    litellm: "gpt-4o",
  },
};

/**
 * ProviderManager handles LLM provider routing with automatic fallback.
 *
 * Priority chain: groq > openai > anthropic > openrouter > gemini
 * Supports hot-swapping providers at runtime.
 */
export class ProviderManager {
  private adapters = new Map<ProviderId, LLMAdapter>();
  private health = new Map<ProviderId, { healthy: boolean; lastCheck: Date }>();
  private activeProvider?: ProviderId;
  private activeModel?: string;

  constructor(apiKeys: ApiKeys) {
    this.registerProviders(apiKeys);
  }

  private registerProviders(keys: ApiKeys): void {
    if (keys.groq) {
      this.adapters.set("groq", new GroqAdapter(keys.groq));
    }
    if (keys.openai) {
      this.adapters.set("openai", new OpenAIAdapter(keys.openai));
    }
    if (keys.anthropic) {
      this.adapters.set("anthropic", new AnthropicAdapter(keys.anthropic));
    }
    if (keys.openrouter) {
      this.adapters.set("openrouter", new OpenRouterAdapter(keys.openrouter));
    }
    if (keys.gemini) {
      this.adapters.set("gemini", new GeminiAdapter(keys.gemini));
    }
  }

  /** Get the priority-ordered list of available providers */
  private getProviderChain(): ProviderId[] {
    const all: ProviderId[] = [
      "groq",
      "openai",
      "anthropic",
      "openrouter",
      "gemini",
    ];
    return all.filter((id) => this.adapters.has(id));
  }

  /** Get a specific adapter by provider ID */
  getAdapter(providerId: ProviderId): LLMAdapter | undefined {
    return this.adapters.get(providerId);
  }

  /** Get the best available adapter (first healthy in priority chain) */
  getBestAdapter(): LLMAdapter | undefined {
    for (const id of this.getProviderChain()) {
      const h = this.health.get(id);
      if (!h || h.healthy) {
        return this.adapters.get(id);
      }
    }
    return undefined;
  }

  /** Set active provider and model (hot-swap) */
  setActive(providerId: ProviderId, model?: string): void {
    if (!this.adapters.has(providerId)) {
      throw new Error(`Provider "${providerId}" is not configured`);
    }
    this.activeProvider = providerId;
    if (model) {
      this.activeModel = model;
    }
  }

  /** Get the currently active provider, or best available */
  getActiveAdapter(): LLMAdapter | undefined {
    if (this.activeProvider) {
      return this.adapters.get(this.activeProvider);
    }
    return this.getBestAdapter();
  }

  /** Get model for a provider and spec */
  getModel(providerId: ProviderId, spec: ModelSpec = "default"): string {
    if (this.activeModel && providerId === this.activeProvider) {
      return this.activeModel;
    }
    return modelConfigs[spec][providerId] ?? modelConfigs[spec].openai;
  }

  /** Mark a provider as unhealthy (for fallback) */
  markUnhealthy(providerId: ProviderId): void {
    this.health.set(providerId, { healthy: false, lastCheck: new Date() });
  }

  /** Mark a provider as healthy */
  markHealthy(providerId: ProviderId): void {
    this.health.set(providerId, { healthy: true, lastCheck: new Date() });
  }

  /** Get health status of all providers */
  getHealthStatus(): Array<{
    providerId: ProviderId;
    healthy: boolean;
    lastCheck: Date;
  }> {
    return Array.from(this.health.entries()).map(([id, h]) => ({
      providerId: id,
      ...h,
    }));
  }

  /** List all available provider IDs */
  getAvailableProviders(): ProviderId[] {
    return this.getProviderChain();
  }

  /**
   * Get a LangChain-compatible BaseChatModel for the best available provider.
   * This bridges our adapter system with existing LangChain-based agent runners.
   */
  getLangChainModel(spec: ModelSpec = "default"): any {
    // Use the shared createLLM with the first available provider's keys
    const providerId = this.getProviderChain()[0];
    if (!providerId) {
      throw new Error(
        "No LLM providers available. Add an API key in Settings.",
      );
    }
    const adapter = this.adapters.get(providerId);
    // We need the API key to create a LangChain model - look it up from the adapter's stored key
    // The adapters store apiKey in their constructor, so we access it via a type assertion
    const apiKey = (adapter as any)?.apiKey;
    if (!apiKey) {
      throw new Error(`No API key for provider "${providerId}"`);
    }
    const apiKeys: ApiKeys = { [providerId]: apiKey };
    const { createLLM } = require("./shared");
    return createLLM(apiKeys, spec);
  }

  /** Stream with automatic fallback on failure */
  async *streamWithFallback(
    messages: LLMMessage[],
    spec: ModelSpec = "default",
    options?: LLMOptions,
    onToken?: (token: string) => void,
  ): AsyncGenerator<{ token: string; provider: ProviderId }, void, unknown> {
    const chain = this.getProviderChain();
    let lastError: Error | undefined;

    for (const providerId of chain) {
      const adapter = this.adapters.get(providerId)!;
      const model = this.getModel(providerId, spec);

      try {
        this.markHealthy(providerId);
        const stream = adapter.stream(messages, model, options, onToken);
        for await (const token of stream) {
          yield { token, provider: providerId };
        }
        return; // success
      } catch (err: any) {
        lastError = err;
        this.markUnhealthy(providerId);
        console.warn(
          `[ProviderManager] ${providerId} failed: ${err.message}. Trying next...`,
        );
      }
    }

    throw new Error(
      `All providers failed. Last error: ${lastError?.message ?? "No providers available"}`,
    );
  }

  /** Complete with automatic fallback on failure */
  async completeWithFallback(
    messages: LLMMessage[],
    spec: ModelSpec = "default",
    options?: LLMOptions,
  ): Promise<{ content: string; provider: ProviderId }> {
    const chain = this.getProviderChain();
    let lastError: Error | undefined;

    for (const providerId of chain) {
      const adapter = this.adapters.get(providerId)!;
      const model = this.getModel(providerId, spec);

      try {
        this.markHealthy(providerId);
        const content = await adapter.complete(messages, model, options);
        return { content, provider: providerId };
      } catch (err: any) {
        lastError = err;
        this.markUnhealthy(providerId);
        console.warn(
          `[ProviderManager] ${providerId} failed: ${err.message}. Trying next...`,
        );
      }
    }

    throw new Error(
      `All providers failed. Last error: ${lastError?.message ?? "No providers available"}`,
    );
  }
}

/**
 * Create a ProviderManager from raw API keys (convenience factory).
 */
export function createProviderManager(apiKeys: ApiKeys): ProviderManager {
  return new ProviderManager(apiKeys);
}
