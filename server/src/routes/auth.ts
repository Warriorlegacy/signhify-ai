import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authMiddleware, AuthRequest, JWT_SECRET } from "../middleware/auth";
import { rateLimit } from "../middleware/ratelimit";

const router: Router = Router();

if (
  !process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_REFRESH_SECRET.length < 32
) {
  throw new Error(
    "FATAL: JWT_REFRESH_SECRET must be set and at least 32 characters. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
  );
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Strict rate limiters for auth endpoints (anti-brute-force)
const authRateLimiter = rateLimit(10, 60000); // 10 requests per minute
const registerRateLimiter = rateLimit(5, 300000); // 5 registrations per 5 minutes

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", registerRateLimiter, async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password, displayName } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    passwordHash,
    displayName,
    plan: "free",
  });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res
    .status(201)
    .json({ token, user: { id: user._id, email, displayName, plan: "free" } });
});

router.post("/login", authRateLimiter, async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      plan: user.plan,
    },
  });
});

router.get("/user", authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
    };
    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const newRefresh = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("refresh_token", newRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ token: newToken });
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("refresh_token");
  res.json({ success: true });
});

export default router;
