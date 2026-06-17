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

export async function classifyIntent(
  task: string,
  apiKey: string,
): Promise<AgentType> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey,
    maxOutputTokens: 10,
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
}

export interface AgentKeys {
  gemini?: string;
  groq?: string;
  tavily?: string;
}
