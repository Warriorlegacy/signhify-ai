import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Note } from "../models/Note";

const router: Router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const profileNote = await Note.findOne({ userId: req.userId, tags: "profile" });
    if (!profileNote) {
      return res.json({
        preferences: {},
        currentProjects: [],
        recurringTasks: [],
        importantPeople: [],
      });
    }

    try {
      const data = JSON.parse(profileNote.content);
      res.json(data);
    } catch {
      res.status(500).json({ error: "Failed to parse profile data" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
