import { Router } from "express";
import cron from "node-cron";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ScheduledTask } from "../models/ScheduledTask";
import { reloadTask, getSchedulerStatus } from "../services/scheduler";

const router: Router = Router();

// GET scheduler status
router.get("/status", authMiddleware, async (_req: AuthRequest, res) => {
  try {
    const status = getSchedulerStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET all scheduled tasks for user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const tasks = await ScheduledTask.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create scheduled task
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      cronExpression,
      prompt,
      agentType,
      destination,
    } = req.body;
    if (!name || !cronExpression || !prompt) {
      return res
        .status(400)
        .json({ error: "name, cronExpression, and prompt are required" });
    }

    if (!cron.validate(cronExpression)) {
      return res.status(400).json({ error: "Invalid cron expression" });
    }

    // Calculate next run
    const interval = cron.getTasks().get("temp");
    let nextRun: Date | undefined;
    try {
      const cronParts = cronExpression.split(" ");
      const now = new Date();
      nextRun = new Date(now);
      // Simple next run calculation (approximate)
      if (cronParts[0] !== "*") nextRun.setMinutes(parseInt(cronParts[0]) || 0);
      if (cronParts[1] !== "*") nextRun.setHours(parseInt(cronParts[1]) || 0);
      if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
    } catch {
      // ignore
    }

    const task = await ScheduledTask.create({
      userId: req.userId,
      name,
      description,
      cronExpression,
      prompt,
      agentType: agentType ?? "general",
      destination: destination ?? "cli",
      enabled: true,
      nextRun,
    });

    // Start the task immediately
    await reloadTask(task._id.toString());

    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update task
router.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const updates = req.body;
    delete updates.userId;

    // Validate cron if updating
    if (updates.cronExpression && !cron.validate(updates.cronExpression)) {
      return res.status(400).json({ error: "Invalid cron expression" });
    }

    const task = await ScheduledTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true },
    );
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Reload the task
    await reloadTask(task._id.toString());

    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const task = await ScheduledTask.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Stop the job
    const { unscheduleTask } = await import("../services/scheduler");
    unscheduleTask(task._id.toString());

    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle enable/disable
router.post("/:id/toggle", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const task = await ScheduledTask.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.enabled = !task.enabled;
    await task.save();

    // Reload or unschedule
    if (task.enabled) {
      await reloadTask(task._id.toString());
    } else {
      const { unscheduleTask } = await import("../services/scheduler");
      unscheduleTask(task._id.toString());
    }

    res.json({ enabled: task.enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET last result for a task
router.get("/:id/result", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const task = await ScheduledTask.findOne(
      { _id: req.params.id, userId: req.userId },
      "name lastRun lastResult runCount enabled cronExpression",
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST manually trigger a task
router.post("/:id/run", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const task = await ScheduledTask.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Execute immediately
    const { executeTask } = await import("../services/scheduler");
    const result = await (executeTask as any)(task);

    await ScheduledTask.findByIdAndUpdate(task._id, {
      lastRun: new Date(),
      lastResult: result.slice(0, 2000),
      $inc: { runCount: 1 },
    });

    res.json({ result: result.slice(0, 2000), executedAt: new Date() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
