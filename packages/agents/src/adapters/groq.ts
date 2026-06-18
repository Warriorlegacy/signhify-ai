import { ChatGroq } from "@langchain/groq";
import type { LLMAdapter, LLMMessage, LLMOptions } from "./base";
import type { ProviderId } from "@signhify/types";

export class GroqAdapter implements LLMAdapter {
  readonly providerId: ProviderId = "groq";
  readonly label = "Groq";

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildClient(model: string, streaming = true) {
    return new ChatGroq({
      model,
      apiKey: this.apiKey,
      streaming,
    });
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
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "deepseek-coder-v2",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ];
  }
}
