import type {
  ProviderId,
  LLMMessage,
  LLMOptions,
  LLMAdapter,
} from "@signhify/types";

export type { ProviderId, LLMMessage, LLMOptions, LLMAdapter };

export interface AdapterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  models?: string[];
}

export interface ProviderHealth {
  providerId: ProviderId;
  lastCheck: Date;
  latencyMs: number;
  healthy: boolean;
  error?: string;
}
