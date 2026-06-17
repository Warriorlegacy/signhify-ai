import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

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

  const channel = input.channel ?? "email";

  const systemPrompt = `You are Herald, the communication agent of Signhify AI.
You draft professional emails, messages, WhatsApp texts, and calendar events.

Channel: ${channel}

For emails: include subject line prefixed with "Subject:", then body.
For messages: keep concise and natural.
For WhatsApp: casual but clear.
For calendar: include title, date/time, duration, description.

Always use a clear, professional tone appropriate to the channel.
If the user asks you to actually send (not just draft), explain that sending requires connecting their email/messaging service.`;

  const userMessage = input.context
    ? `Task: ${input.task}\n\nContext:\n${input.context}`
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
