import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Note } from "../models/Note";
import { computeEmbedding, cosineSimilarity } from "@signhify/memory";

const router: Router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const { search } = req.query;
  if (search && typeof search === "string") {
    const queryVec = computeEmbedding(search);
    const notes = await Note.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .limit(200);
    const scored = notes
      .filter((n) => n.embedding && n.embedding.length > 0)
      .map((n) => ({
        ...n.toObject(),
        _score: cosineSimilarity(queryVec.vector, n.embedding!),
      }))
      .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
      .slice(0, 10)
      .map(({ _score, ...rest }) => rest);
    const exactMatches = notes.filter(
      (n) => !n.embedding || n.embedding.length === 0,
    );
    return res.json([...scored, ...exactMatches]);
  }
  const notes = await Note.find({ userId: req.userId })
    .sort({ updatedAt: -1 })
    .limit(50);
  res.json(notes);
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { title, content, tags, visibility } = req.body;
  const embedding = content ? computeEmbedding(content).vector : undefined;
  const note = await Note.create({
    userId: req.userId,
    title,
    content,
    tags: tags ?? [],
    visibility: visibility ?? "private",
    embedding,
  });
  res.status(201).json(note);
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

router.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const allowed = ["title", "content", "tags", "visibility"];
  const updates: any = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    updates,
    { new: true },
  );
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json({ success: true });
});

export default router;
