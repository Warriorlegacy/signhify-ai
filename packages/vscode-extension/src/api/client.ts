import * as vscode from "vscode";

export interface StreamEvent {
  type: string;
  message?: string;
  agentType?: string;
  token?: string;
  error?: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  skill?: unknown;
}

export interface CompletionResult {
  completions: Array<{ text: string; provider: string }>;
}

export class SignhifyClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async *chat(
    message: string,
    context?: string,
    threadId?: string,
  ): AsyncGenerator<StreamEvent, void, unknown> {
    const res = await fetch(`${this.baseUrl}/api/agents/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ message, context, threadId }),
    });

    if (!res.ok) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const event: StreamEvent = JSON.parse(line.slice(5).trim());
          yield event;
        } catch {
          /* skip malformed events */
        }
      }
    }
  }

  async complete(
    filePath: string,
    prefix: string,
    suffix: string,
    language?: string,
  ): Promise<CompletionResult> {
    const res = await fetch(`${this.baseUrl}/api/agents/complete`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ filePath, prefix, suffix, language }),
    });

    if (!res.ok) {
      throw new Error(`Completion request failed: ${res.status}`);
    }

    return res.json() as Promise<CompletionResult>;
  }

  updateToken(token: string) {
    this.token = token;
  }

  updateServerUrl(url: string) {
    this.baseUrl = url;
  }
}
