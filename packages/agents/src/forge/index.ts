import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

export interface ForgeInput {
  task: string;
  language?: string;
  context?: string;
}

export async function runForgeAgent(
  input: ForgeInput,
  apiKeys: { gemini?: string; groq?: string },
  onToken: (token: string) => void,
) {
  const model = apiKeys.groq
    ? new ChatGroq({
        model: "deepseek-coder-v2",
        apiKey: apiKeys.groq,
        streaming: true,
      })
    : new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: apiKeys.gemini!,
        streaming: true,
      });

  const systemPrompt = `You are Forge, the code intelligence agent of Signhify AI.
You are an expert programmer who writes clean, well-documented code.
Language: ${input.language ?? "typescript"}

Follow these rules:
1. Write production-quality code with error handling
2. Include type annotations where applicable
3. Explain the code structure briefly before the code
4. Use modern best practices for the language
5. If the task is to explain code, provide a clear explanation
6. If suggesting terminal commands, prefix with $\`;

${input.context ? `\nContext:\n${input.context}` : ""}`;

  const stream = await model.stream([
    { role: "system", content: systemPrompt },
    { role: "user", content: input.task },
  ]);

  let fullResponse = "";
  for await (const chunk of stream) {
    const token = chunk.content as string;
    onToken(token);
    fullResponse += token;
  }
  return fullResponse;
}
