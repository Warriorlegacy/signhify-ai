import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { byokMiddleware } from "../middleware/byok";
import { createProviderManager } from "@signhify/agents";

const router: Router = Router();

/**
 * POST /api/agents/complete
 * Code completion endpoint for IDE extensions.
 * Sends code context to the Forge agent's code model and returns suggestions.
 */
router.post(
  "/",
  authMiddleware,
  byokMiddleware,
  async (req: AuthRequest, res) => {
    const { filePath, position, prefix, suffix, language } = req.body;
    const userKeys = (req as any).userKeys as Record<
      string,
      string | undefined
    >;

    const hasAnyKey = !!(
      userKeys.groq ||
      userKeys.openai ||
      userKeys.anthropic ||
      userKeys.openrouter ||
      userKeys.gemini ||
      userKeys.mistral ||
      userKeys.together ||
      userKeys.cerebras ||
      userKeys.sambanova ||
      userKeys.cloudflare
    );

    if (!hasAnyKey) {
      return res
        .status(400)
        .json({ error: "At least one LLM API key required." });
    }

    try {
      const manager = createProviderManager({
        gemini: userKeys.gemini,
        groq: userKeys.groq,
        openai: userKeys.openai,
        anthropic: userKeys.anthropic,
        openrouter: userKeys.openrouter,
        mistral: userKeys.mistral,
        together: userKeys.together,
        cerebras: userKeys.cerebras,
        sambanova: userKeys.sambanova,
        cloudflare: userKeys.cloudflare,
        cloudflareAccountId: userKeys.cloudflareAccountId,
      });

      const systemPrompt = `You are a code completion assistant. Complete the code naturally based on the context.
Return ONLY the completed code, no explanations or markdown.
The completion should fit seamlessly into the existing code.

Language: ${language || "unknown"}
File: ${filePath || "unknown"}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        {
          role: "user" as const,
          content: `Code before cursor:\n${prefix}\n\nCode after cursor:\n${suffix}\n\nComplete the code:`,
        },
      ];

      const { content, provider } = await manager.completeWithFallback(
        messages,
        "code",
      );

      res.json({
        completions: [{ text: content.trim(), provider }],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message ?? "Completion failed." });
    }
  },
);

export default router;
