import { createLLM } from "./shared";
import { AgentType } from "./nexus/router";

export interface SkillCandidate {
  name: string;
  description: string;
  promptTemplate: string;
  agentType: AgentType;
  examples: Array<{ input: string; output: string }>;
  tags: string[];
  confidence: number;
}

export async function detectSkillCandidate(
  task: string,
  response: string,
  agentType: AgentType,
  apiKeys: {
    gemini?: string;
    groq?: string;
    openai?: string;
    anthropic?: string;
    openrouter?: string;
  },
): Promise<SkillCandidate | null> {
  // We need at least one LLM key to run the detector.
  if (!apiKeys.gemini && !apiKeys.groq && !apiKeys.openai && !apiKeys.anthropic && !apiKeys.openrouter) {
    return null;
  }

  const model = createLLM(apiKeys, "default");

  const systemPrompt = `You are the Skill Discovery Engine of Signhify AI.
Your job is to analyze a completed user task and the agent's response, and determine if it represents a reusable skill or prompt template.
A reusable skill is a pattern or a specific template that a user would run multiple times with different variables (e.g. drafting reports, scraping specific details, code templates, form emails).
If it is a generic one-off task (like "hi", "how are you", or a highly specific bug fix), confidence should be low (< 0.6).
If it's reusable, extract a generalized prompt template replacing specific values with variables in brackets like {{variable_name}} or {{input}}.

Respond with a JSON object ONLY matching this schema. Do not output codeblocks, markdown formatting, or any extra text.

JSON Schema:
{
  "name": "Short uppercase name, e.g. DRAFT_WEEKLY_REPORT or GENERATE_SQL_QUERY",
  "description": "Short explanation of what the skill does",
  "promptTemplate": "Generalized prompt with {{variable_name}} placeholders",
  "agentType": "${agentType}",
  "examples": [{"input": "Original input task", "output": "A brief snippet or summary of the output"}],
  "tags": ["tag1", "tag2"],
  "confidence": 0.95
}`;

  const userPrompt = `User Task: ${task}\n\nAgent Response:\n${response.slice(0, 1000)}`;

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

    const candidate = JSON.parse(cleaned) as SkillCandidate;
    if (candidate.confidence >= 0.7) {
      return candidate;
    }
    return null;
  } catch (err) {
    console.error("Failed to detect skill candidate:", err);
    return null;
  }
}
