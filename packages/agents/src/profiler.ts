import { createLLM } from "./shared";

export async function extractProfileSignals(
  history: Array<{ role: string; content: string }>,
  apiKeys: {
    gemini?: string;
    groq?: string;
    openai?: string;
    anthropic?: string;
    openrouter?: string;
  },
): Promise<{
  preferences?: Record<string, any>;
  currentProjects?: string[];
  recurringTasks?: string[];
  importantPeople?: string[];
} | null> {
  if (!apiKeys.gemini && !apiKeys.groq && !apiKeys.openai && !apiKeys.anthropic && !apiKeys.openrouter) {
    return null;
  }

  const model = createLLM(apiKeys, "default");

  const systemPrompt = `You are the User Profiling Engine of Signhify AI.
Your job is to read the recent conversation exchange and extract any durable user profiling information.
Durable profile elements are:
1. User preferences (e.g. "prefers concise answers", "likes dark mode", "uses python for backend")
2. Current projects they are working on (e.g. "Signhify AI", "personal website")
3. Recurring tasks (e.g. "weekly reporting", "morning standup")
4. Important people mentioned (e.g. "Alice (manager)", "Bob (cofounder)")

Respond with a JSON object ONLY matching this schema. Do not output codeblocks, markdown formatting, or any extra text.

JSON Schema:
{
  "preferences": {},
  "currentProjects": [],
  "recurringTasks": [],
  "importantPeople": []
}`;

  const userPrompt = `Conversation History:\n${history.map(h => `${h.role}: ${h.content}`).join("\n")}`;

  try {
    const rawResponse = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    let cleaned = (typeof rawResponse.content === "string" ? rawResponse.content : "").trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to extract profile signals:", err);
    return null;
  }
}
