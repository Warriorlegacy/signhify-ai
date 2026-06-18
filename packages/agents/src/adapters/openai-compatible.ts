import { ChatOpenAI } from "@langchain/openai";
import type { LLMAdapter, LLMMessage, LLMOptions } from "./base";
import type { ProviderId } from "@signhify/types";

export class OpenAICompatibleAdapter implements LLMAdapter {
  readonly providerId: ProviderId;
  readonly label: string;

  private apiKey: string;
  private baseUrl: string;
  private defaultModels: string[];

  constructor(
    providerId: ProviderId,
    label: string,
    apiKey: string,
    baseUrl: string,
    defaultModels: string[],
  ) {
    this.providerId = providerId;
    this.label = label;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModels = defaultModels;
  }

  private buildClient(model: string, streaming = true) {
    return new ChatOpenAI({
      model,
      apiKey: this.apiKey,
      streaming,
      configuration: {
        baseURL: this.baseUrl,
      },
    } as any);
  }

  async *stream(
    messages: LLMMessage[],
    model: string,
    _options?: LLMOptions,
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
    return this.defaultModels;
  }
}
