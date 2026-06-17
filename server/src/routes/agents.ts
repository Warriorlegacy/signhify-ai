import { Router } from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { byokMiddleware } from "../middleware/byok";
import { rateLimit } from "../middleware/ratelimit";
import {
  classifyIntent,
  runScribeAgent,
  runScoutAgent,
  runForgeAgent,
  runVaultAgent,
  runHeraldAgent,
  runVisionAgent,
} from "@signhify/agents";
import { globalMemoryStore } from "@signhify/memory";
import { Thread } from "../models/Thread";
import { Note } from "../models/Note";

const router: Router = Router();

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

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const send = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

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
          const op = result.operation;
          const userId = req.userId!;
          if (op.action === "save" && op.key && op.value) {
            globalMemoryStore.set(userId, op.key, op.value);
            await Note.create({
              userId,
              title: op.key,
              content: op.value,
              tags: ["vault"],
              visibility: "private",
            });
          } else if (op.action === "retrieve" && op.key) {
            const entry = globalMemoryStore.get(userId, op.key);
            fullContent = entry
              ? `Here's what I found:\n\n${entry.value}`
              : `I couldn't find anything saved under "${op.key}".`;
          } else if (op.action === "list") {
            const entries = globalMemoryStore.list(userId);
            fullContent =
              entries.length > 0
                ? `Here's what you've saved:\n\n${entries
                    .map((e) => `• ${e.key}`)
                    .join("\n")}`
                : "You haven't saved anything yet.";
          } else if (op.action === "search" && op.key) {
            const entries = globalMemoryStore.search(userId, op.key);
            fullContent =
              entries.length > 0
                ? `Found matches:\n\n${entries
                    .map((e) => `• ${e.key}: ${e.value.slice(0, 100)}`)
                    .join("\n")}`
                : `No matches found for "${op.key}".`;
          } else if (op.action === "delete" && op.key) {
            globalMemoryStore.delete(userId, op.key);
            fullContent = `Deleted "${op.key}".`;
          }
        }
        if (threadId) {
          await Note.findOneAndUpdate(
            { userId: req.userId, title: { $regex: "vault" } },
            { $set: { updatedAt: new Date() } },
          );
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
          { gemini },
          onToken,
        );
      } else {
        const model = new ChatGoogleGenerativeAI({
          model: "gemini-2.0-flash",
          apiKey: gemini,
          streaming: true,
        });
        const stream = await model.stream([{ role: "user", content: message }]);
        for await (const chunk of stream) {
          const token = chunk.content as string;
          onToken(token);
          fullContent += token;
        }
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

      send({ type: "done" });
      res.end();
    } catch (err: any) {
      send({
        type: "error",
        message: err.message ?? "Agent failed. Check your API keys.",
      });
      res.end();
    }
  },
);

export default router;
