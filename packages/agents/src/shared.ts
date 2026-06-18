import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type ApiKeys = {
  gemini?: string;
  groq?: string;
  openai?: string;
  anthropic?: string;
  openrouter?: string;
};

type ModelSpec = "default" | "code" | "quick" | "powerful";

const modelConfigs: Record<
  ModelSpec,
  { gemini: string; groq: string; openai: string; anthropic: string; openrouter: string }
> = {
  default: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-20241022",
    openrouter: "meta-llama/llama-3.3-70b-instruct",
  },
  code: {
    gemini: "gemini-2.0-flash",
    groq: "deepseek-coder-v2",
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    openrouter: "deepseek/deepseek-coder",
  },
  quick: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.1-8b-instant",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-20241022",
    openrouter: "meta-llama/llama-3.1-8b-instruct:free",
  },
  powerful: {
    gemini: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    openrouter: "anthropic/claude-3.5-sonnet",
  },
};

/**
 * Selects the best available LLM from the provided API keys.
 * Priority: groq > openai > anthropic > openrouter > gemini
 */
export function createLLM(
  apiKeys: ApiKeys,
  spec: ModelSpec = "default"
): any {
  const models = modelConfigs[spec];

  if (apiKeys.groq) {
    return new ChatGroq({
      model: models.groq,
      apiKey: apiKeys.groq,
      streaming: true,
    });
  }

  if (apiKeys.openai) {
    return new ChatOpenAI({
      model: models.openai,
      apiKey: apiKeys.openai,
      streaming: true,
    });
  }

  if (apiKeys.anthropic) {
    return new ChatAnthropic({
      model: models.anthropic,
      apiKey: apiKeys.anthropic,
      streaming: true,
    });
  }

  if (apiKeys.openrouter) {
    // OpenRouter uses OpenAI-compatible API
    return new ChatOpenAI({
      model: models.openrouter,
      apiKey: apiKeys.openrouter,
      streaming: true,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://signhify.ai",
          "X-Title": "Signhify AI",
        },
      },
    });
  }

  // Fallback to Gemini
  return new ChatGoogleGenerativeAI({
    model: models.gemini,
    apiKey: apiKeys.gemini!,
    streaming: true,
  });
}

/**
 * Returns the active provider name for status display
 */
export function getProviderName(apiKeys: ApiKeys): string {
  if (apiKeys.groq) return "Groq";
  if (apiKeys.openai) return "OpenAI";
  if (apiKeys.anthropic) return "Anthropic";
  if (apiKeys.openrouter) return "OpenRouter";
  return "Gemini";
}

export async function streamResponse(
  model: any,
  messages: Array<{ role: string; content: string }>,
  onToken: (token: string) => void
): Promise<string> {
  const stream = await model.stream(messages as any);
  let fullResponse = "";
  for await (const chunk of stream) {
    const token = chunk.content as string;
    onToken(token);
    fullResponse += token;
  }
  return fullResponse;
}

export async function runAgentWithStreaming(
  model: any,
  systemPrompt: string,
  userMessage: string,
  onToken: (token: string) => void
): Promise<string> {
  return streamResponse(
    model,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    onToken
  );
}
