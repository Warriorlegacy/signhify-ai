import { createLLM, runAgentWithStreaming } from "../shared";

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
  const model = createLLM(apiKeys, "code");

  return runAgentWithStreaming(
    model,
    `You are Forge, the code intelligence agent of Signhify AI.
You are an expert programmer who writes clean, well-documented code.
Language: ${input.language ?? "typescript"}

Follow these rules:
1. Write production-quality code with error handling
2. Include type annotations where applicable
3. Explain the code structure briefly before the code
4. Use modern best practices for the language
5. If the task is to explain code, provide a clear explanation
6. If suggesting terminal commands, prefix with $\`;${input.context ? `\n\nContext:\n${input.context}` : ""}`,
    input.task,
    onToken,
  );
}
