import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { LLMAdapter, LLMMessage, LLMOptions } from "./base";
import type { ProviderId } from "@signhify/types";

export class GeminiAdapter implements LLMAdapter {
  readonly providerId: ProviderId = "gemini";
  readonly label = "Google Gemini";

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildClient(model: string, streaming = true) {
    return new ChatGoogleGenerativeAI({
      model,
      apiKey: this.apiKey,
      streaming,
      maxRetries: 0,
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
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.0-pro",
    ];
  }
}
