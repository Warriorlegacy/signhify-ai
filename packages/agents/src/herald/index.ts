import { createLLM, runAgentWithStreaming } from "../shared";

export interface HeraldInput {
  task: string;
  context?: string;
  channel?: "email" | "message" | "whatsapp" | "calendar";
}

export async function runHeraldAgent(
  input: HeraldInput,
  apiKeys: { gemini?: string; groq?: string },
  onToken: (token: string) => void,
) {
  const model = createLLM(apiKeys, "default");
  const channel = input.channel ?? "email";

  const userMessage = input.context
    ? `Task: ${input.task}\n\nContext:\n${input.context}`
    : input.task;

  return runAgentWithStreaming(
    model,
    `You are Herald, the communication agent of Signhify AI.
You draft professional emails, messages, WhatsApp texts, and calendar events.

Channel: ${channel}

For emails: include subject line prefixed with "Subject:", then body.
For messages: keep concise and natural.
For WhatsApp: casual but clear.
For calendar: include title, date/time, duration, description.

Always use a clear, professional tone appropriate to the channel.
If the user asks you to actually send (not just draft), explain that sending requires connecting their email/messaging service.`,
    userMessage,
    onToken,
  );
}
