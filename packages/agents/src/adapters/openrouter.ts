import { ChatOpenAI } from "@langchain/openai";
import type { LLMAdapter, LLMMessage, LLMOptions } from "./base";
import type { ProviderId } from "@signhify/types";

export class OpenRouterAdapter implements LLMAdapter {
  readonly providerId: ProviderId = "openrouter";
  readonly label = "OpenRouter";

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildClient(model: string, streaming = true) {
    return new ChatOpenAI({
      model,
      apiKey: this.apiKey,
      streaming,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://signhify.ai",
          "X-Title": "Signhify AI",
        },
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
    return [
      "anthropic/claude-3.5-sonnet",
      "meta-llama/llama-3.3-70b-instruct",
      "google/gemini-pro",
      "deepseek/deepseek-coder",
      "meta-llama/llama-3.1-8b-instruct:free",
    ];
  }
}
