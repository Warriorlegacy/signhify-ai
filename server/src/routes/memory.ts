import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { memoryManager } from "../services/memory-manager";

const router: Router = Router();

// GET /api/memory/stats - Get memory stats for user
router.get("/stats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const stats = await memoryManager.getMemoryStats(req.userId!);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/memory/episodes - List recent episodes
router.get("/episodes", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "10")) || 10, 50);
    const episodes = await memoryManager.getRecentEpisodes(req.userId!, limit);
    res.json(episodes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/memory/episodes/search - Search episodes
router.post(
  "/episodes/search",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { query, topK } = req.body;
      if (!query) return res.status(400).json({ error: "query is required" });

      const episodes = await memoryManager.searchEpisodes(
        req.userId!,
        query,
        topK ?? 5,
      );
      res.json(episodes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST /api/memory/episodes - Add an episode
router.post("/episodes", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { summary, threadId, participants, keyFacts, sentiment, topics } =
      req.body;
    if (!summary) return res.status(400).json({ error: "summary is required" });

    const episode = await memoryManager.addEpisode({
      userId: req.userId!,
      threadId,
      summary,
      participants,
      keyFacts,
      sentiment,
      topics,
    });
    res.status(201).json(episode);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/memory/facts - List all facts
router.get("/facts", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const facts = await memoryManager.listFacts(req.userId!);
    res.json(facts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/memory/facts/search - Search facts by semantic similarity
router.post("/facts/search", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { query, topK } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const facts = await memoryManager.searchFacts(
      req.userId!,
      query,
      topK ?? 10,
    );
    res.json(facts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/memory/facts - Add/update a fact
router.post("/facts", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { key, value, confidence, source, tags } = req.body;
    if (!key || !value) {
      return res.status(400).json({ error: "key and value are required" });
    }

    const fact = await memoryManager.addFact({
      userId: req.userId!,
      key,
      value,
      confidence,
      source,
      tags,
    });
    res.status(201).json(fact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/memory/facts/:key - Get a specific fact
router.get("/facts/:key", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const fact = await memoryManager.getFact(
      req.userId!,
      String(req.params.key),
    );
    if (!fact) return res.status(404).json({ error: "Fact not found" });
    res.json(fact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/memory/facts/:key - Delete a fact
router.delete("/facts/:key", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deleted = await memoryManager.deleteFact(
      req.userId!,
      String(req.params.key),
    );
    if (!deleted) return res.status(404).json({ error: "Fact not found" });
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/memory/facts/:key - Contradict/update a fact
router.patch("/facts/:key", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { value } = req.body;
    if (!value) return res.status(400).json({ error: "value is required" });

    const fact = await memoryManager.contradictFact(
      req.userId!,
      String(req.params.key),
      value,
    );
    if (!fact) return res.status(404).json({ error: "Fact not found" });
    res.json(fact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/memory/context - Get relevant context for agent injection
router.get("/context", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const query = String(req.query.q ?? "");
    if (!query) return res.status(400).json({ error: "q (query) is required" });

    const context = await memoryManager.getRelevantContext(req.userId!, query);
    res.json({ context });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
