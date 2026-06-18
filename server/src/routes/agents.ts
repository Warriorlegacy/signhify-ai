import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { byokMiddleware } from "../middleware/byok";
import { rateLimit } from "../middleware/ratelimit";
import { setupSSE, sendSSE, sendDone, sendError } from "../services/streaming";
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
import { memoryManager } from "../services/memory-manager";
import { createContextLogger } from "../lib/logger";

const log = createContextLogger("agents");
const router: Router = Router();

async function handleVaultOp(
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

router.post(
  "/chat",
  authMiddleware,
  byokMiddleware,
  rateLimit(100, 60000),
  async (req: AuthRequest, res) => {
    const { message, context, threadId } = req.body;
    const userKeys = (req as any).userKeys as {
      gemini?: string;
      groq?: string;
      openai?: string;
      anthropic?: string;
      openrouter?: string;
      tavily?: string;
    };
    const { gemini, groq, openai, anthropic, openrouter, tavily } = userKeys;

    if (!gemini && !openai && !anthropic && !openrouter && !groq) {
      return res
        .status(400)
        .json({
          error:
            "At least one LLM API key required (Gemini, OpenAI, Anthropic, OpenRouter, or Groq). Add it in Settings.",
        });
    }

    const allKeys = { gemini, groq, openai, anthropic, openrouter };

    // Create ProviderManager with user's keys for fallback support
    const providerManager = createProviderManager(allKeys);

    setupSSE(res);
    const send = (data: object) => sendSSE(res, data);

    try {
      send({ type: "status", message: "Routing to the right agent..." });
      const agentType = await classifyIntent(message, gemini);
      send({ type: "agent", agentType });

      // Retrieve memory context for the user
      let memoryContext = "";
      try {
        memoryContext = await memoryManager.getRelevantContext(
          req.userId!,
          message,
        );
      } catch (memErr) {
        log.warn({ err: memErr }, "Failed to retrieve memory context");
      }

      // Merge user-provided context with memory context
      const enrichedContext =
        [context, memoryContext].filter(Boolean).join("\n\n") || undefined;

      const onToken = (token: string) => send({ type: "token", token });

      let fullContent = "";

      if (agentType === "scribe") {
        fullContent = await runScribeAgent(
          { task: message, context: enrichedContext },
          allKeys,
          onToken,
        );
      } else if (agentType === "scout") {
        send({ type: "status", message: "Searching web sources..." });
        const result = await runScoutAgent(
          { query: message },
          { ...allKeys, tavily },
          onToken,
        );
        send({ type: "citations", sources: result.sources });
        fullContent = result.answer;
      } else if (agentType === "forge") {
        fullContent = await runForgeAgent({ task: message }, allKeys, onToken);
      } else if (agentType === "vault") {
        const result = await runVaultAgent(
          { task: message, context: enrichedContext },
          allKeys,
          onToken,
        );
        fullContent = result.response;
        if (result.operation) {
          const vaultResponse = await handleVaultOp(
            result.operation,
            req.userId!,
          );
          if (vaultResponse) {
            send({ type: "token", token: `\n\n${vaultResponse}` });
            fullContent += `\n\n${vaultResponse}`;
          }
        }
      } else if (agentType === "herald") {
        fullContent = await runHeraldAgent(
          { task: message, context: enrichedContext },
          allKeys,
          onToken,
        );
      } else if (agentType === "vision") {
        fullContent = await runVisionAgent(
          { task: message, imageDescription: context },
          allKeys,
          onToken,
        );
      } else {
        // General fallback - use ProviderManager with memory-enriched context
        try {
          const model = providerManager.getLangChainModel("default");
          const enrichedMessages = [];
          if (enrichedContext) {
            enrichedMessages.push({
              role: "system",
              content: `You are a helpful AI assistant. Use the following context to inform your response:\n\n${enrichedContext}`,
            });
          }
          enrichedMessages.push({ role: "user", content: message });
          fullContent = await streamResponse(model, enrichedMessages, onToken);
        } catch {
          // If ProviderManager fails, fall back to createLLM
          const model = createLLM(allKeys, "default");
          fullContent = await streamResponse(
            model,
            [{ role: "user", content: message }],
            onToken,
          );
        }
      }

      // Store episode in memory
      try {
        await memoryManager.addEpisode({
          userId: req.userId!,
          threadId,
          summary: message.slice(0, 500),
          keyFacts: [fullContent.slice(0, 300)],
          topics: [agentType],
          sentiment: "neutral",
        });
      } catch (memErr) {
        log.warn({ err: memErr }, "Failed to store episode");
      }

      // Update profile interaction stats
      try {
        await memoryManager.updateProfileInteraction(req.userId!, agentType);
      } catch (profErr) {
        log.warn({ err: profErr }, "Failed to update profile stats");
      }

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

      // Skill auto-detection
      try {
        const { detectSkillCandidate } = await import("@signhify/agents");
        const skillCandidate = await detectSkillCandidate(
          message,
          fullContent,
          agentType,
          allKeys,
        );
        if (skillCandidate) {
          send({ type: "skill-suggestion", skill: skillCandidate });
        }
      } catch (skillErr) {
        log.warn({ err: skillErr }, "Skill detection failed");
      }

      // User Profile signal extraction
      try {
        const { extractProfileSignals } = await import("@signhify/agents");
        const history = [
          { role: "user", content: message },
          { role: "assistant", content: fullContent },
        ];
        const signals = await extractProfileSignals(history, allKeys);
        if (
          signals &&
          ((signals.preferences &&
            Object.keys(signals.preferences).length > 0) ||
            (signals.currentProjects && signals.currentProjects.length > 0) ||
            (signals.recurringTasks && signals.recurringTasks.length > 0) ||
            (signals.importantPeople && signals.importantPeople.length > 0))
        ) {
          // Find existing profile note
          let profileNote = await Note.findOne({
            userId: req.userId!,
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

          // Merge preferences
          if (signals.preferences) {
            profileData.preferences = {
              ...profileData.preferences,
              ...signals.preferences,
            };
          }
          // Merge lists uniquely
          const mergeUnique = (arr1: string[] = [], arr2: string[] = []) => {
            return Array.from(new Set([...arr1, ...arr2]));
          };

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
              userId: req.userId!,
              title: "User Profile",
              content: JSON.stringify(profileData, null, 2),
              tags: ["profile"],
              visibility: "private",
            });
          }
        }
      } catch (profileErr) {
        log.warn({ err: profileErr }, "User profiling failed");
      }

      sendDone(res);
    } catch (err: any) {
      sendError(res, err.message ?? "Agent failed. Check your API keys.");
    }
  },
);

export default router;
