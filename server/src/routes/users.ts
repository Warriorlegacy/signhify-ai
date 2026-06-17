import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router: Router = Router();

router.get("/profile", authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.patch("/profile", authMiddleware, async (req: AuthRequest, res) => {
  const allowed = ["displayName", "settings"];
  const updates: any = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
  }).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.get("/preferences", authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select("settings");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user.settings);
});

export default router;
