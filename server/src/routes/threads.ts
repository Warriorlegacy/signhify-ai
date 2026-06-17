import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Thread } from "../models/Thread";

const router: Router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const threads = await Thread.find({ userId: req.userId })
    .select("title createdAt updatedAt agentsInvoked tags")
    .sort({ updatedAt: -1 })
    .limit(50);
  res.json(threads);
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const thread = await Thread.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!thread) return res.status(404).json({ error: "Thread not found" });
  res.json(thread);
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { title, message } = req.body;
  const thread = await Thread.create({
    userId: req.userId,
    title: title ?? message?.slice(0, 80) ?? "New conversation",
    messages: message
      ? [
          {
            id: crypto.randomUUID(),
            threadId: "",
            role: "user",
            content: message,
            timestamp: new Date(),
          },
        ]
      : [],
    agentsInvoked: [],
    tags: [],
  });
  thread.messages.forEach((m) => (m.threadId = thread._id.toString()));
  await thread.save();
  res.status(201).json(thread);
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const thread = await Thread.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!thread) return res.status(404).json({ error: "Thread not found" });
  res.json({ success: true });
});

export default router;
