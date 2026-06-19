import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export type AgentType =
  | "scribe"
  | "scout"
  | "forge"
  | "vault"
  | "herald"
  | "vision"
  | "general";

const CLASSIFICATION_PROMPT = PromptTemplate.fromTemplate(`
You are Nexus, the routing core of Signhify AI. Classify the user's task into exactly one agent type.

Agent types:
- scribe: writing, summarizing, editing, rewriting documents or content
- scout: web search, research, fact-checking, finding information online
- forge: code generation, code explanation, terminal commands, debugging
- vault: saving notes, retrieving past notes, memory management
- herald: sending emails, drafting messages, WhatsApp, calendar events
- vision: image analysis, OCR, screenshot reading
- general: casual chat, questions about Signhify itself, unclear intent

Respond with ONLY the agent type name, lowercase, no punctuation.

User task: {task}
`);

function classifyIntentByKeywords(task: string): AgentType {
  const lower = task.toLowerCase();

  if (lower.includes("image") || lower.includes("photo") || lower.includes("picture") || lower.includes("screenshot") || lower.includes("ocr") || lower.includes("see") || lower.includes("look at")) {
    return "vision";
  }
  if (lower.includes("email") || lower.includes("message") || lower.includes("whatsapp") || lower.includes("calendar") || lower.includes("send message") || lower.includes("draft communication")) {
    return "herald";
  }
  if (lower.includes("save") || lower.includes("remember") || lower.includes("store") || lower.includes("recall") || lower.includes("retrieve") || lower.includes("note") || lower.includes("memory") || lower.includes("vault")) {
    return "vault";
  }
  if (lower.includes("code") || lower.includes("program") || lower.includes("debug") || lower.includes("script") || lower.includes("function") || lower.includes("compile") || lower.includes("terminal") || lower.includes("bash") || lower.includes("developer")) {
    return "forge";
  }
  if (lower.includes("search") || lower.includes("web") || lower.includes("google") || lower.includes("find online") || lower.includes("tavily") || lower.includes("research")) {
    return "scout";
  }
  if (lower.includes("write") || lower.includes("summarize") || lower.includes("edit") || lower.includes("rewrite") || lower.includes("draft") || lower.includes("article") || lower.includes("blog")) {
    return "scribe";
  }
  return "general";
}

export async function classifyIntent(
  task: string,
  apiKey?: string,
): Promise<AgentType> {
  if (!apiKey) {
    return classifyIntentByKeywords(task);
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey,
      maxOutputTokens: 10,
      maxRetries: 0,
    });

    const chain = CLASSIFICATION_PROMPT.pipe(model).pipe(
      new StringOutputParser(),
    );
    const result = await chain.invoke({ task });
    const normalized = result.trim().toLowerCase() as AgentType;

    const valid: AgentType[] = [
      "scribe",
      "scout",
      "forge",
      "vault",
      "herald",
      "vision",
      "general",
    ];
    return valid.includes(normalized) ? normalized : "general";
  } catch (err) {
    console.warn("Nexus intent classification failed, falling back to keywords:", err);
    return classifyIntentByKeywords(task);
  }
}

export interface AgentKeys {
  gemini?: string;
  groq?: string;
  tavily?: string;
}
