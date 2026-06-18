import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { byokMiddleware } from "../middleware/byok";
import { createProviderManager, FREE_MODELS } from "@signhify/agents";
import type { ProviderId } from "@signhify/types";

const router: Router = Router();

/**
 * GET /api/providers/health
 * Returns health status of all configured providers and which free models are available.
 */
router.get(
  "/health",
  authMiddleware,
  byokMiddleware,
  async (req: AuthRequest, res) => {
    const userKeys = (req as any).userKeys as Record<
      string,
      string | undefined
    >;

    const configuredProviders: ProviderId[] = [];
    const providerMap: Record<string, string | undefined> = {
      groq: userKeys.groq,
      openai: userKeys.openai,
      anthropic: userKeys.anthropic,
      openrouter: userKeys.openrouter,
      gemini: userKeys.gemini,
      mistral: userKeys.mistral,
      together: userKeys.together,
      cerebras: userKeys.cerebras,
      sambanova: userKeys.sambanova,
      cloudflare: userKeys.cloudflare,
    };

    for (const [id, key] of Object.entries(providerMap)) {
      if (key) configuredProviders.push(id as ProviderId);
    }

    const freeModelsAvailable = FREE_MODELS.filter((m) =>
      configuredProviders.includes(m.provider),
    ).sort((a, b) => a.priority - b.priority);

    const paidProviders = configuredProviders.filter(
      (p) => !freeModelsAvailable.some((f) => f.provider === p),
    );

    res.json({
      configuredProviders,
      freeModels: freeModelsAvailable.map((m) => ({
        provider: m.provider,
        model: m.model,
        label: m.label,
        priority: m.priority,
        maxTokens: m.maxTokens,
        requestsPerMin: m.requestsPerMin,
      })),
      paidProviders,
      totalFreeModels: freeModelsAvailable.length,
      totalProviders: configuredProviders.length,
    });
  },
);

/**
 * GET /api/providers/models
 * List all available models across configured providers.
 */
router.get(
  "/models",
  authMiddleware,
  byokMiddleware,
  async (req: AuthRequest, res) => {
    const userKeys = (req as any).userKeys as Record<
      string,
      string | undefined
    >;

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

      const chain = manager.getFreeFirstChain();
      res.json({
        models: chain.map((entry) => ({
          provider: entry.provider,
          model: entry.model,
          isFree: entry.isFree,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
