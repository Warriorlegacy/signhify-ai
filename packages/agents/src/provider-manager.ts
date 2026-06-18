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
import { MistralAdapter } from "./adapters/mistral";
import { TogetherAdapter } from "./adapters/together";
import { CerebrasAdapter } from "./adapters/cerebras";
import { SambaNovaAdapter } from "./adapters/sambanova";
import { CloudflareAdapter } from "./adapters/cloudflare";
import { CircuitBreaker } from "./circuit-breaker";
import { getAvailableFreeModels } from "./free-models";

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

export type ModelSpec = "default" | "code" | "quick" | "powerful";

const modelConfigs: Record<ModelSpec, Record<ProviderId, string>> = {
  default: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-20241022",
    openrouter: "meta-llama/llama-3.3-70b-instruct",
    litellm: "gpt-4o-mini",
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
    litellm: "gpt-4o",
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
    litellm: "gpt-4o-mini",
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
    litellm: "gpt-4o",
    mistral: "mistral-large-latest",
    together: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    cerebras: "llama3.1-70b",
    sambanova: "Meta-Llama-3.1-70B-Instruct",
    cloudflare: "@cf/meta/llama-3.1-70b-instruct",
  },
};

/**
 * ProviderManager handles LLM provider routing with automatic free-first fallback.
 *
 * Free-first chain: groq > cerebras > sambanova > together > mistral > gemini > openrouter > cloudflare
 * Paid fallback:    groq > openai > anthropic > openrouter > gemini > mistral > together > cerebras > sambanova > cloudflare
 *
 * Includes circuit breaker: after 3 consecutive failures, a provider is skipped for 60s.
 */
export class ProviderManager {
  private adapters = new Map<ProviderId, LLMAdapter>();
  private health = new Map<ProviderId, { healthy: boolean; lastCheck: Date }>();
  private circuitBreaker = new CircuitBreaker();
  private activeProvider?: ProviderId;
  private activeModel?: string;

  constructor(apiKeys: ApiKeys) {
    this.registerProviders(apiKeys);
  }

  private registerProviders(keys: ApiKeys): void {
    if (keys.groq) this.adapters.set("groq", new GroqAdapter(keys.groq));
    if (keys.openai)
      this.adapters.set("openai", new OpenAIAdapter(keys.openai));
    if (keys.anthropic)
      this.adapters.set("anthropic", new AnthropicAdapter(keys.anthropic));
    if (keys.openrouter)
      this.adapters.set("openrouter", new OpenRouterAdapter(keys.openrouter));
    if (keys.gemini)
      this.adapters.set("gemini", new GeminiAdapter(keys.gemini));
    if (keys.mistral)
      this.adapters.set("mistral", new MistralAdapter(keys.mistral));
    if (keys.together)
      this.adapters.set("together", new TogetherAdapter(keys.together));
    if (keys.cerebras)
      this.adapters.set("cerebras", new CerebrasAdapter(keys.cerebras));
    if (keys.sambanova)
      this.adapters.set("sambanova", new SambaNovaAdapter(keys.sambanova));
    if (keys.cloudflare && keys.cloudflareAccountId) {
      this.adapters.set(
        "cloudflare",
        new CloudflareAdapter(keys.cloudflare, keys.cloudflareAccountId),
      );
    }
  }

  /** Full priority chain (paid providers) */
  private getProviderChain(): ProviderId[] {
    const all: ProviderId[] = [
      "groq",
      "openai",
      "anthropic",
      "openrouter",
      "gemini",
      "mistral",
      "together",
      "cerebras",
      "sambanova",
      "cloudflare",
    ];
    return all.filter((id) => this.adapters.has(id));
  }

  /** Get available provider IDs */
  getAvailableProviders(): ProviderId[] {
    return this.getProviderChain();
  }

  /** Get a specific adapter by provider ID */
  getAdapter(providerId: ProviderId): LLMAdapter | undefined {
    return this.adapters.get(providerId);
  }

  /** Get the best available adapter (first healthy in priority chain) */
  getBestAdapter(): LLMAdapter | undefined {
    for (const id of this.getProviderChain()) {
      if (this.circuitBreaker.isOpen(id)) continue;
      const h = this.health.get(id);
      if (!h || h.healthy) return this.adapters.get(id);
    }
    return undefined;
  }

  /** Set active provider and model (hot-swap) */
  setActive(providerId: ProviderId, model?: string): void {
    if (!this.adapters.has(providerId)) {
      throw new Error(`Provider "${providerId}" is not configured`);
    }
    this.activeProvider = providerId;
    if (model) this.activeModel = model;
  }

  /** Get the currently active provider, or best available */
  getActiveAdapter(): LLMAdapter | undefined {
    if (this.activeProvider) return this.adapters.get(this.activeProvider);
    return this.getBestAdapter();
  }

  /** Get model for a provider and spec */
  getModel(providerId: ProviderId, spec: ModelSpec = "default"): string {
    if (this.activeModel && providerId === this.activeProvider)
      return this.activeModel;
    return modelConfigs[spec][providerId] ?? modelConfigs[spec].openai;
  }

  /** Mark a provider as unhealthy */
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

  /** Get circuit breaker status */
  getCircuitStatus() {
    return this.circuitBreaker.getStatus();
  }

  /**
   * Build a free-first chain: free models from available providers first,
   * then paid models as fallback.
   */
  getFreeFirstChain(): Array<{
    provider: ProviderId;
    model: string;
    isFree: boolean;
  }> {
    const chain: Array<{
      provider: ProviderId;
      model: string;
      isFree: boolean;
    }> = [];
    const available = this.getAvailableProviders();
    const freeModels = getAvailableFreeModels(available);

    for (const fm of freeModels) {
      chain.push({ provider: fm.provider, model: fm.model, isFree: true });
    }

    for (const providerId of this.getProviderChain()) {
      chain.push({
        provider: providerId,
        model: this.getModel(providerId, "default"),
        isFree: false,
      });
    }

    return chain;
  }

  /** Get a LangChain-compatible model (bridges to existing agent code) */
  getLangChainModel(spec: ModelSpec = "default"): any {
    const providerId = this.getProviderChain()[0];
    if (!providerId) {
      throw new Error(
        "No LLM providers available. Add an API key in Settings.",
      );
    }
    const adapter = this.adapters.get(providerId);
    const apiKey = (adapter as any)?.apiKey;
    if (!apiKey) throw new Error(`No API key for provider "${providerId}"`);
    const apiKeys: ApiKeys = { [providerId]: apiKey };
    const { createLLM } = require("./shared");
    return createLLM(apiKeys, spec);
  }

  /** Stream with automatic free-first fallback + circuit breaker */
  async *streamWithFallback(
    messages: LLMMessage[],
    spec: ModelSpec = "default",
    options?: LLMOptions,
    onToken?: (token: string) => void,
  ): AsyncGenerator<{ token: string; provider: ProviderId }, void, unknown> {
    const chain = this.getFreeFirstChain();
    let lastError: Error | undefined;

    for (const entry of chain) {
      if (this.circuitBreaker.isOpen(entry.provider)) continue;
      const adapter = this.adapters.get(entry.provider);
      if (!adapter) continue;

      try {
        this.markHealthy(entry.provider);
        const stream = adapter.stream(messages, entry.model, options, onToken);
        for await (const token of stream) {
          yield { token, provider: entry.provider };
        }
        this.circuitBreaker.reset(entry.provider);
        return;
      } catch (err: any) {
        lastError = err;
        this.markUnhealthy(entry.provider);
        this.circuitBreaker.recordFailure(entry.provider);
        console.warn(
          `[ProviderManager] ${entry.provider} (${entry.model}) failed: ${err.message}. Trying next...`,
        );
      }
    }

    throw new Error(
      `All providers failed. Last error: ${lastError?.message ?? "No providers available"}`,
    );
  }

  /** Complete with automatic free-first fallback + circuit breaker */
  async completeWithFallback(
    messages: LLMMessage[],
    spec: ModelSpec = "default",
    options?: LLMOptions,
  ): Promise<{ content: string; provider: ProviderId }> {
    const chain = this.getFreeFirstChain();
    let lastError: Error | undefined;

    for (const entry of chain) {
      if (this.circuitBreaker.isOpen(entry.provider)) continue;
      const adapter = this.adapters.get(entry.provider);
      if (!adapter) continue;

      try {
        this.markHealthy(entry.provider);
        const content = await adapter.complete(messages, entry.model, options);
        this.circuitBreaker.reset(entry.provider);
        return { content, provider: entry.provider };
      } catch (err: any) {
        lastError = err;
        this.markUnhealthy(entry.provider);
        this.circuitBreaker.recordFailure(entry.provider);
        console.warn(
          `[ProviderManager] ${entry.provider} (${entry.model}) failed: ${err.message}. Trying next...`,
        );
      }
    }

    throw new Error(
      `All providers failed. Last error: ${lastError?.message ?? "No providers available"}`,
    );
  }
}

/** Create a ProviderManager from raw API keys */
export function createProviderManager(apiKeys: ApiKeys): ProviderManager {
  return new ProviderManager(apiKeys);
}
