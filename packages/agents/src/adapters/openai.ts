import { ChatOpenAI } from "@langchain/openai";
import type { LLMAdapter, LLMMessage, LLMOptions } from "./base";
import type { ProviderId } from "@signhify/types";

export class OpenAIAdapter implements LLMAdapter {
  readonly providerId: ProviderId = "openai";
  readonly label = "OpenAI";

  private apiKey: string;
  private baseUrl?: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private buildClient(model: string, streaming = true) {
    const config: Record<string, unknown> = {
      model,
      apiKey: this.apiKey,
      streaming,
    };
    if (this.baseUrl) {
      config.configuration = { baseURL: this.baseUrl };
    }
    return new ChatOpenAI(config as any);
  }

  async *stream(
    messages: LLMMessage[],
    model: string,
    options?: LLMOptions,
    onToken?: (token: string) => void,
  ): AsyncGenerator<string, void, unknown> {
    const client = this.buildClient(model);
    const lcMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const stream = await client.stream(lcMessages as any);

    for await (const chunk of stream) {
      const token = chunk.content as string;
      if (token) {
        onToken?.(token);
        yield token;
      }
    }
  }

  async complete(
    messages: LLMMessage[],
    model: string,
    _options?: LLMOptions,
  ): Promise<string> {
    const client = this.buildClient(model, false);
    const lcMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await client.invoke(lcMessages as any);
    return result.content as string;
  }

  async listModels(): Promise<string[]> {
    return [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
      "o1-preview",
      "o1-mini",
    ];
  }
}
