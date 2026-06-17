import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

type ApiKeys = { gemini?: string; groq?: string };

type ModelSpec = "default" | "code" | "quick";

const modelConfigs: Record<ModelSpec, { gemini: string; groq: string }> = {
  default: { gemini: "gemini-2.0-flash", groq: "llama-3.3-70b-versatile" },
  code: { gemini: "gemini-2.0-flash", groq: "deepseek-coder-v2" },
  quick: { gemini: "gemini-2.0-flash", groq: "llama-3.3-70b-versatile" },
};

export function createLLM(apiKeys: ApiKeys, spec: ModelSpec = "default") {
  const models = modelConfigs[spec];
  if (apiKeys.groq) {
    return new ChatGroq({
      model: models.groq,
      apiKey: apiKeys.groq,
      streaming: true,
    });
  }
  return new ChatGoogleGenerativeAI({
    model: models.gemini,
    apiKey: apiKeys.gemini!,
    streaming: true,
  });
}

export async function streamResponse(
  model: any,
  messages: Array<{ role: string; content: string }>,
  onToken: (token: string) => void,
): Promise<string> {
  const stream = await model.stream(messages);
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
  onToken: (token: string) => void,
): Promise<string> {
  return streamResponse(model, [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ], onToken);
}
