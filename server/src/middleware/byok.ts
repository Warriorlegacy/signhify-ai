import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function byokMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  (req as any).userKeys = {
    gemini: req.headers["x-gemini-key"] as string | undefined,
    groq: req.headers["x-groq-key"] as string | undefined,
    openai: req.headers["x-openai-key"] as string | undefined,
    anthropic: req.headers["x-anthropic-key"] as string | undefined,
    openrouter: req.headers["x-openrouter-key"] as string | undefined,
    tavily: req.headers["x-tavily-key"] as string | undefined,
    elevenlabs: req.headers["x-elevenlabs-key"] as string | undefined,
  };
  next();
}

declare global {
  namespace Express {
    interface Request {
      userKeys?: {
        gemini?: string;
        groq?: string;
        openai?: string;
        anthropic?: string;
        openrouter?: string;
        tavily?: string;
        elevenlabs?: string;
      };
    }
  }
}
