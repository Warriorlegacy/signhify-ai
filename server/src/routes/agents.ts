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
  VaultOperation,
} from "@signhify/agents";
import { globalMemoryStore } from "@signhify/memory";
import { Thread } from "../models/Thread";
import { Note } from "../models/Note";

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
      tavily?: string;
    };
    const { gemini, groq, tavily } = userKeys;

    if (!gemini) {
      return res
        .status(400)
        .json({ error: "Gemini API key required. Add it in Settings." });
    }

    setupSSE(res);
    const send = (data: object) => sendSSE(res, data);

    try {
      send({ type: "status", message: "Routing to the right agent..." });
      const agentType = await classifyIntent(message, gemini);
      send({ type: "agent", agentType });

      const onToken = (token: string) => send({ type: "token", token });

      let fullContent = "";

      if (agentType === "scribe") {
        fullContent = await runScribeAgent(
          { task: message, context },
          { gemini, groq },
          onToken,
        );
      } else if (agentType === "scout" && tavily) {
        const result = await runScoutAgent(
          { query: message },
          { gemini, tavily },
          onToken,
        );
        fullContent = result.answer;
      } else if (agentType === "forge") {
        fullContent = await runForgeAgent(
          { task: message },
          { gemini, groq },
          onToken,
        );
      } else if (agentType === "vault") {
        const result = await runVaultAgent(
          { task: message, context },
          { gemini, groq },
          onToken,
        );
        fullContent = result.response;
        if (result.operation) {
          const vaultResponse = await handleVaultOp(result.operation, req.userId!);
          if (vaultResponse) {
            send({ type: "token", token: `\n\n${vaultResponse}` });
            fullContent += `\n\n${vaultResponse}`;
          }
        }
      } else if (agentType === "herald") {
        fullContent = await runHeraldAgent(
          { task: message, context },
          { gemini, groq },
          onToken,
        );
      } else if (agentType === "vision") {
        fullContent = await runVisionAgent(
          { task: message, imageDescription: context },
          { gemini, groq },
          onToken,
        );
      } else {
        const model = createLLM({ gemini, groq }, "default");
        fullContent = await streamResponse(
          model,
          [{ role: "user", content: message }],
          onToken,
        );
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

      sendDone(res);
    } catch (err: any) {
      sendError(res, err.message ?? "Agent failed. Check your API keys.");
    }
  },
);

export default router;
