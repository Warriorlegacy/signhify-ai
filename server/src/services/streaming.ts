import { Response } from "express";

export function setupSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

export function sendSSE(res: Response, data: object) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function sendDone(res: Response) {
  sendSSE(res, { type: "done" });
  res.end();
}

export function sendError(res: Response, message: string) {
  sendSSE(res, { type: "error", message });
  res.end();
}
