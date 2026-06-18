import { ChatAnthropic } from "@langchain/anthropic";
import type { LLMAdapter, LLMMessage, LLMOptions } from "./base";
import type { ProviderId } from "@signhify/types";

export class AnthropicAdapter implements LLMAdapter {
  readonly providerId: ProviderId = "anthropic";
  readonly label = "Anthropic";

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildClient(model: string, streaming = true) {
    return new ChatAnthropic({
      model,
      apiKey: this.apiKey,
      streaming,
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
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];
  }
}
