import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { skillRegistry } from "../services/skill-registry";

const router: Router = Router();

// GET all skills for user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const skills = await skillRegistry.list(req.userId!);
    res.json(skills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single skill
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const skill = await skillRegistry.getById(
      req.userId!,
      String(req.params.id),
    );
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create skill
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      kind,
      triggerPhrases,
      steps,
      tags,
      isPublic,
      safetyLevel,
    } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "name and description are required" });
    }

    const skill = await skillRegistry.create(req.userId!, {
      name,
      description,
      kind,
      triggerPhrases,
      steps,
      tags,
      isPublic,
      safetyLevel,
      createdBy: "user",
    });
    res.status(201).json(skill);
  } catch (err: any) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "A skill with this name already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH update skill
router.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const allowed = [
      "name",
      "description",
      "triggerPhrases",
      "steps",
      "tags",
      "isPublic",
      "safetyLevel",
      "version",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const skill = await skillRegistry.update(
      req.userId!,
      String(req.params.id),
      updates,
    );
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE skill
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deleted = await skillRegistry.delete(
      req.userId!,
      String(req.params.id),
    );
    if (!deleted) return res.status(404).json({ error: "Skill not found" });
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST approve skill (requires approval workflow)
router.post("/:id/approve", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const skill = await skillRegistry.approve(
      req.userId!,
      String(req.params.id),
    );
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST reject skill
router.post("/:id/reject", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const skill = await skillRegistry.reject(
      req.userId!,
      String(req.params.id),
    );
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST find matching skill for a query
router.post("/match", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const skill = await skillRegistry.findMatchingSkill(req.userId!, query);
    res.json({ matched: !!skill, skill });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST record skill usage
router.post("/:id/use", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { success, durationMs } = req.body;
    await skillRegistry.recordUsage(
      String(req.params.id),
      success ?? true,
      durationMs ?? 0,
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
