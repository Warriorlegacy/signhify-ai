export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  plan: "free" | "pro" | "team";
  teamId?: string;
  settings: UserSettings;
}

export interface UserSettings {
  preferredModel: string;
  voiceEnabled: boolean;
  voicePersonality: "nova" | "echo" | "shimmer";
  ttsEngine: "browser" | "elevenlabs";
}

export interface Thread {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  agentsInvoked: string[];
  tags: string[];
}

export interface Message {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentId?: string;
  toolCallId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface MemoryNote {
  id: string;
  userId: string;
  teamId?: string;
  title: string;
  content: string;
  tags: string[];
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
  visibility: "private" | "team";
}

export type AgentType = "scribe" | "scout" | "forge" | "herald" | "vault" | "vision" | "general";

export interface AgentRequest {
  task: string;
  context?: string;
  threadId?: string;
}

export interface AgentResponse {
  content: string;
  agentType: AgentType;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  metadata?: Record<string, unknown>;
}

export interface StreamEvent {
  type: "status" | "agent" | "token" | "error" | "done";
  message?: string;
  agentType?: AgentType;
  token?: string;
  error?: string;
}

export interface UserKeys {
  gemini?: string;
  groq?: string;
  tavily?: string;
  elevenlabs?: string;
}

export interface ApiError {
  error: string;
  errorCode?: string;
  statusCode: number;
}
