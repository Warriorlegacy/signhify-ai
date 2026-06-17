import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

export interface ScribeInput {
  task: string;
  context?: string;
  format?: "markdown" | "plain" | "json";
}

export async function runScribeAgent(
  input: ScribeInput,
  apiKeys: { gemini?: string; groq?: string },
  onToken: (token: string) => void,
) {
  const model = apiKeys.groq
    ? new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: apiKeys.groq,
        streaming: true,
      })
    : new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: apiKeys.gemini!,
        streaming: true,
      });

  const systemPrompt = `You are Scribe, the document intelligence agent of Signhify AI.
You are an expert writer, editor, and summarizer. You produce high-quality, well-structured content.
Output format: ${input.format ?? "markdown"}. Be concise, accurate, and actionable.`;

  const userMessage = input.context
    ? `Task: ${input.task}\n\nContent to work with:\n${input.context}`
    : input.task;

  const stream = await model.stream([
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ]);

  let fullResponse = "";
  for await (const chunk of stream) {
    const token = chunk.content as string;
    onToken(token);
    fullResponse += token;
  }
  return fullResponse;
}
