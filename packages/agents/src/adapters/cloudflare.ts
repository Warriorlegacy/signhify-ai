import type { LLMAdapter, LLMMessage, LLMOptions } from "./base";
import type { ProviderId } from "@signhify/types";

export class CloudflareAdapter implements LLMAdapter {
  readonly providerId: ProviderId = "cloudflare";
  readonly label = "Cloudflare Workers AI";

  private apiKey: string;
  private accountId: string;

  constructor(apiKey: string, accountId: string) {
    this.apiKey = apiKey;
    this.accountId = accountId;
  }

  private getEndpoint(model: string): string {
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${model}`;
  }

  async *stream(
    messages: LLMMessage[],
    model: string,
    _options?: LLMOptions,
    onToken?: (token: string) => void,
  ): AsyncGenerator<string, void, unknown> {
    const endpoint = this.getEndpoint(model);
    const systemMsg = messages.find((m) => m.role === "system");
    const userMsgs = messages.filter((m) => m.role === "user");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          ...(systemMsg
            ? [{ role: "system", content: systemMsg.content }]
            : []),
          ...userMsgs.map((m) => ({ role: "user", content: m.content })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Cloudflare API error ${response.status}: ${body}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const data = JSON.parse(line.slice(5).trim());
          if (data.response) {
            onToken?.(data.response);
            yield data.response;
          }
        } catch {
          /* skip malformed */
        }
      }
    }
  }

  async complete(
    messages: LLMMessage[],
    model: string,
    options?: LLMOptions,
  ): Promise<string> {
    let result = "";
    for await (const token of this.stream(messages, model, options)) {
      result += token;
    }
    return result;
  }

  async listModels(): Promise<string[]> {
    return [
      "@cf/meta/llama-3.1-8b-instruct",
      "@cf/meta/llama-3.1-70b-instruct",
      "@cf/qwen/qwen1.5-14b-chat-awq",
      "@cf/mistral/mistral-7b-instruct-v0.2",
      "@cf/google/gemma-2b-it-lora",
    ];
  }
}
