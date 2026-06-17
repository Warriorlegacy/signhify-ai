import { createLLM, runAgentWithStreaming } from "../shared";

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
  const model = createLLM(apiKeys, "default");

  const userMessage = input.context
    ? `Task: ${input.task}\n\nContent to work with:\n${input.context}`
    : input.task;

  return runAgentWithStreaming(
    model,
    `You are Scribe, the document intelligence agent of Signhify AI.
You are an expert writer, editor, and summarizer. You produce high-quality, well-structured content.
Output format: ${input.format ?? "markdown"}. Be concise, accurate, and actionable.`,
    userMessage,
    onToken,
  );
}
