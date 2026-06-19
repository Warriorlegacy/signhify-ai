import { Router, NextFunction, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Thread } from "../models/Thread";

const router: Router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const threads = await Thread.find({ userId: req.userId })
      .select("title createdAt updatedAt agentsInvoked tags")
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(threads);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const thread = await Thread.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    res.json(thread);
  } catch (err) {
    next(err);
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, message } = req.body;
    
    const thread = new Thread({
      userId: req.userId,
      title: title ?? message?.slice(0, 80) ?? "New conversation",
      messages: [],
      agentsInvoked: [],
      tags: [],
    });

    if (message) {
      thread.messages.push({
        id: crypto.randomUUID(),
        threadId: thread._id.toString(),
        role: "user",
        content: message,
        timestamp: new Date(),
      } as any);
    }

    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const thread = await Thread.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
