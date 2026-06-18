import { createContextLogger } from "../lib/logger";
import {
  classifyIntent,
  runScribeAgent,
  runScoutAgent,
  runForgeAgent,
  runVaultAgent,
  runHeraldAgent,
  runVisionAgent,
  createLLM,
  streamResponse,
  createProviderManager,
  VaultOperation,
} from "@signhify/agents";
import { globalMemoryStore } from "@signhify/memory";
import { Thread } from "../models/Thread";
import { Note } from "../models/Note";
import { memoryManager } from "./memory-manager";

const log = createContextLogger("chat-orchestrator");

export interface ChatRequest {
  message: string;
  context?: string;
  threadId?: string;
  userId: string;
  userKeys: {
    gemini?: string;
    groq?: string;
    openai?: string;
    anthropic?: string;
    openrouter?: string;
    mistral?: string;
    together?: string;
    cerebras?: string;
    sambanova?: string;
    cloudflare?: string;
    cloudflareAccountId?: string;
    tavily?: string;
  };
}

interface ChatCallbacks {
  onStatus: (message: string) => void;
  onAgent: (agentType: string) => void;
  onToken: (token: string) => void;
  onCitations: (sources: any[]) => void;
  onSkillSuggestion: (skill: any) => void;
}

/**
 * ChatOrchestrator extracts the 380-line monolithic chat handler into
 * a testable, modular service with clearly separated pipeline stages:
 *
 * 1. Classify intent (Nexus router)
 * 2. Retrieve memory context
 * 3. Execute agent
 * 4. Store episode + update profile
 * 5. Detect skills + extract profile signals
 */
export class ChatOrchestrator {
  /** Validate that the user has at least one LLM API key */
  validateKeys(keys: ChatRequest["userKeys"]): string | null {
    const hasKey = !!(
      keys.gemini ||
      keys.openai ||
      keys.anthropic ||
      keys.openrouter ||
      keys.groq ||
      keys.mistral ||
      keys.together ||
      keys.cerebras ||
      keys.sambanova ||
      keys.cloudflare
    );
    if (!hasKey) {
      return "At least one LLM API key required. Add it in Settings. Free options: Groq, Gemini, Cerebras, SambaNova, Together AI, Mistral.";
    }
    return null;
  }

  /** Stage 1: Classify user intent to route to the right agent */
  async classifyIntent(message: string, geminiKey?: string): Promise<string> {
    return classifyIntent(message, geminiKey);
  }

  /** Stage 2: Retrieve relevant memory context for the user */
  async getMemoryContext(userId: string, message: string): Promise<string> {
    try {
      return await memoryManager.getRelevantContext(userId, message);
    } catch (err) {
      log.warn({ err }, "Failed to retrieve memory context");
      return "";
    }
  }

  /** Stage 3: Execute the appropriate agent */
  async executeAgent(
    agentType: string,
    request: ChatRequest,
    enrichedContext: string | undefined,
    callbacks: ChatCallbacks,
  ): Promise<string> {
    const { message, userKeys } = request;
    const allKeys = { ...userKeys };
    const onToken = callbacks.onToken;

    switch (agentType) {
      case "scribe":
        return runScribeAgent(
          { task: message, context: enrichedContext },
          allKeys,
          onToken,
        );

      case "scout": {
        callbacks.onStatus("Searching web sources...");
        const result = await runScoutAgent(
          { query: message },
          { ...allKeys, tavily: userKeys.tavily },
          onToken,
        );
        callbacks.onCitations(result.sources);
        return result.answer;
      }

      case "forge":
        return runForgeAgent({ task: message }, allKeys, onToken);

      case "vault": {
        const result = await runVaultAgent(
          { task: message, context: enrichedContext },
          allKeys,
          onToken,
        );
        let content = result.response;
        if (result.operation) {
          const vaultResponse = await this.handleVaultOp(
            result.operation,
            request.userId,
          );
          if (vaultResponse) {
            onToken(`\n\n${vaultResponse}`);
            content += `\n\n${vaultResponse}`;
          }
        }
        return content;
      }

      case "herald":
        return runHeraldAgent(
          { task: message, context: enrichedContext },
          allKeys,
          onToken,
        );

      case "vision":
        return runVisionAgent(
          { task: message, imageDescription: request.context },
          allKeys,
          onToken,
        );

      default:
        return this.executeGeneralAgent(
          message,
          enrichedContext,
          allKeys,
          onToken,
        );
    }
  }

  /** Stage 4: Store episode in memory and update user profile */
  async storeInteraction(
    userId: string,
    message: string,
    fullContent: string,
    agentType: string,
    threadId?: string,
  ): Promise<void> {
    // Store episode
    try {
      await memoryManager.addEpisode({
        userId,
        threadId,
        summary: message.slice(0, 500),
        keyFacts: [fullContent.slice(0, 300)],
        topics: [agentType],
        sentiment: "neutral",
      });
    } catch (err) {
      log.warn({ err }, "Failed to store episode");
    }

    // Update profile interaction stats
    try {
      await memoryManager.updateProfileInteraction(userId, agentType);
    } catch (err) {
      log.warn({ err }, "Failed to update profile stats");
    }

    // Update thread if applicable
    if (threadId) {
      await Thread.findByIdAndUpdate(threadId, {
        $push: {
          messages: {
            id: crypto.randomUUID(),
            threadId,
            role: "assistant",
            content: fullContent,
            agentId: agentType,
            timestamp: new Date(),
          },
        },
        $addToSet: { agentsInvoked: agentType },
      });
    }
  }

  /** Stage 5: Detect skill candidates and extract profile signals */
  async postProcess(
    userId: string,
    message: string,
    fullContent: string,
    agentType: string,
    allKeys: ChatRequest["userKeys"],
    callbacks: ChatCallbacks,
  ): Promise<void> {
    // Skill auto-detection
    try {
      const { detectSkillCandidate } = await import("@signhify/agents");
      const skillCandidate = await detectSkillCandidate(
        message,
        fullContent,
        agentType as any,
        allKeys,
      );
      if (skillCandidate) {
        callbacks.onSkillSuggestion(skillCandidate);
      }
    } catch (err) {
      log.warn({ err }, "Skill detection failed");
    }

    // User profile signal extraction
    try {
      const { extractProfileSignals } = await import("@signhify/agents");
      const history = [
        { role: "user", content: message },
        { role: "assistant", content: fullContent },
      ];
      const signals = await extractProfileSignals(history, allKeys);
      if (signals && this.hasProfileSignals(signals)) {
        await this.mergeProfileSignals(userId, signals);
      }
    } catch (err) {
      log.warn({ err }, "User profiling failed");
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────

  private async executeGeneralAgent(
    message: string,
    enrichedContext: string | undefined,
    allKeys: ChatRequest["userKeys"],
    onToken: (token: string) => void,
  ): Promise<string> {
    try {
      const providerManager = createProviderManager(allKeys);
      const model = providerManager.getLangChainModel("default");
      const messages: any[] = [];
      if (enrichedContext) {
        messages.push({
          role: "system",
          content: `You are a helpful AI assistant. Use the following context to inform your response:\n\n${enrichedContext}`,
        });
      }
      messages.push({ role: "user", content: message });
      return await streamResponse(model, messages, onToken);
    } catch {
      const model = createLLM(allKeys, "default");
      return await streamResponse(
        model,
        [{ role: "user", content: message }],
        onToken,
      );
    }
  }

  private async handleVaultOp(
    op: VaultOperation,
    userId: string,
  ): Promise<string> {
    if (op.action === "save" && op.key && op.value) {
      globalMemoryStore.set(userId, op.key, op.value);
      await Note.create({
        userId,
        title: op.key,
        content: op.value,
        tags: ["vault"],
        visibility: "private",
      });
      return "";
    }
    if (op.action === "retrieve" && op.key) {
      const entry = globalMemoryStore.get(userId, op.key);
      return entry
        ? `Here's what I found:\n\n${entry.value}`
        : `I couldn't find anything saved under "${op.key}".`;
    }
    if (op.action === "list") {
      const entries = globalMemoryStore.list(userId);
      return entries.length > 0
        ? `Here's what you've saved:\n\n${entries
            .map((e) => `• ${e.key}`)
            .join("\n")}`
        : "You haven't saved anything yet.";
    }
    if (op.action === "search" && op.key) {
      const entries = globalMemoryStore.search(userId, op.key);
      return entries.length > 0
        ? `Found matches:\n\n${entries
            .map((e) => `• ${e.key}: ${e.value.slice(0, 100)}`)
            .join("\n")}`
        : `No matches found for "${op.key}".`;
    }
    if (op.action === "delete" && op.key) {
      globalMemoryStore.delete(userId, op.key);
      return `Deleted "${op.key}".`;
    }
    return "";
  }

  private hasProfileSignals(signals: any): boolean {
    return !!(
      (signals.preferences && Object.keys(signals.preferences).length > 0) ||
      (signals.currentProjects && signals.currentProjects.length > 0) ||
      (signals.recurringTasks && signals.recurringTasks.length > 0) ||
      (signals.importantPeople && signals.importantPeople.length > 0)
    );
  }

  private async mergeProfileSignals(
    userId: string,
    signals: any,
  ): Promise<void> {
    let profileNote = await Note.findOne({
      userId,
      tags: "profile",
    });
    let profileData: any = {
      preferences: {},
      currentProjects: [],
      recurringTasks: [],
      importantPeople: [],
    };

    if (profileNote) {
      try {
        profileData = JSON.parse(profileNote.content);
      } catch {
        // ignore parse errors
      }
    }

    if (signals.preferences) {
      profileData.preferences = {
        ...profileData.preferences,
        ...signals.preferences,
      };
    }
    const mergeUnique = (arr1: string[] = [], arr2: string[] = []) =>
      Array.from(new Set([...arr1, ...arr2]));

    profileData.currentProjects = mergeUnique(
      profileData.currentProjects,
      signals.currentProjects,
    );
    profileData.recurringTasks = mergeUnique(
      profileData.recurringTasks,
      signals.recurringTasks,
    );
    profileData.importantPeople = mergeUnique(
      profileData.importantPeople,
      signals.importantPeople,
    );

    if (profileNote) {
      profileNote.content = JSON.stringify(profileData, null, 2);
      await profileNote.save();
    } else {
      await Note.create({
        userId,
        title: "User Profile",
        content: JSON.stringify(profileData, null, 2),
        tags: ["profile"],
        visibility: "private",
      });
    }
  }
}

export const chatOrchestrator = new ChatOrchestrator();
