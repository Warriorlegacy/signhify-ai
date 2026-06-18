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
  type: "status" | "agent" | "token" | "error" | "done" | "skill-suggestion" | "citations";
  message?: string;
  agentType?: AgentType;
  token?: string;
  error?: string;
  skill?: any;
  sources?: any[];
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

// ─── LLM Provider Layer ──────────────────────────────────────────────

export type ProviderId = "openai" | "anthropic" | "openrouter" | "groq" | "gemini" | "litellm";

export interface ProviderConfig {
  id: ProviderId;
  apiKey: string;
  baseUrl?: string;          // for litellm/openrouter proxied endpoints
  defaultModel: string;
  fallbackModel?: string;
  models: string[];
}

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface LLMAdapter {
  /** Unique provider identifier */
  readonly providerId: ProviderId;
  /** Human-readable label */
  readonly label: string;
  /** Stream a completion, yielding tokens via onToken */
  stream(
    messages: LLMMessage[],
    model: string,
    options?: LLMOptions,
    onToken?: (token: string) => void,
  ): AsyncGenerator<string, void, unknown>;
  /** Non-streaming completion (used by scheduling, reflection, etc.) */
  complete(
    messages: LLMMessage[],
    model: string,
    options?: LLMOptions,
  ): Promise<string>;
  /** List models available from this provider (for UI model picker) */
  listModels?(apiKey?: string): Promise<string[]>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
}

// ─── Memory & User Profiling ─────────────────────────────────────────

export type MemoryType = "episodic" | "semantic" | "procedural";

export interface MemoryEpisode {
  id: string;
  userId: string;
  threadId?: string;
  type: "episodic";
  summary: string;
  participants: string[];
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface MemoryFact {
  id: string;
  userId: string;
  type: "semantic";
  key: string;
  value: string;
  confidence: number;
  source?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  identity: {
    timezone?: string;
    language: string;
    preferredProvider?: ProviderId;
    preferredModel?: string;
  };
  preferences: Record<string, unknown>;
  context: {
    currentProjects: string[];
    recurringTasks: string[];
    importantPeople: string[];
  };
  goals: Array<{
    id: string;
    description: string;
    status: "active" | "completed" | "archived";
    createdAt: Date;
  }>;
  lastRegenerated: Date;
}

export interface MemoryQuery {
  userId: string;
  type?: MemoryType;
  query?: string;
  topK?: number;
  minConfidence?: number;
  after?: Date;
}

// ─── Skills ──────────────────────────────────────────────────────────

export type SkillKind = "tool-sequence" | "prompt-template" | "workflow";

export interface SkillStep {
  order: number;
  kind: "bash" | "llm" | "api" | "gateway" | "memory-query" | "condition";
  description: string;
  command?: string;
  args?: string[];
  prompt?: string;
  model?: string;
  apiRoute?: string;
  gateway?: "telegram" | "discord" | "cli" | "web";
  condition?: string;
  outputVar?: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  description: string;
  kind: SkillKind;
  version: string;
  triggerPhrases: string[];
  steps: SkillStep[];
  tags: string[];
  isPublic: boolean;
  isApproved: boolean;
  createdBy: "user" | "agent";
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  successCount: number;
  failureCount: number;
}

// ─── Scheduling ──────────────────────────────────────────────────────

export type ScheduleDestination =
  | "cli"
  | "telegram"
  | "discord"
  | "email"
  | "webhook";

export interface Schedule {
  id: string;
  userId: string;
  name: string;
  cron: string;
  prompt: string;
  variables?: Record<string, string>;
  destination: ScheduleDestination;
  destinationConfig?: Record<string, unknown>;
  active: boolean;
  lastRunAt?: Date;
  nextRunAt: Date;
  consecutiveFailures: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Gateways ────────────────────────────────────────────────────────

export type GatewayType = "telegram" | "discord";

export interface GatewayConnection {
  id: string;
  userId: string;
  type: GatewayType;
  enabled: boolean;
  config: Record<string, unknown>;
  connectedAt: Date;
  lastActivityAt?: Date;
}
