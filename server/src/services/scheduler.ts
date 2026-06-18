import cron from "node-cron";
import { ScheduledTask } from "../models/ScheduledTask";
import { memoryManager } from "./memory-manager";
import { createContextLogger } from "../lib/logger";

const log = createContextLogger("scheduler");

const activeJobs = new Map<string, any>();
const runningTasks = new Set<string>();

interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  maxBackoffMs: number;
}

const DEFAULT_RETRY: RetryPolicy = {
  maxRetries: 3,
  backoffMs: 5000,
  maxBackoffMs: 60000,
};

/**
 * Execute a single scheduled task with retry logic and memory context.
 */
export async function executeTask(task: any, retryCount = 0): Promise<string> {
  const taskId = task._id.toString();

  if (runningTasks.has(taskId)) {
    log.warn({ taskId }, "Task already running, skipping");
    return "Task already running";
  }

  runningTasks.add(taskId);
  const startTime = Date.now();

  try {
    const { createLLM, streamResponse } = await import("@signhify/agents");

    // Get user-specific keys first, fallback to system keys
    const fallbackKeys = {
      gemini: process.env.SYSTEM_GEMINI_KEY || process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
    };

    if (
      !fallbackKeys.gemini &&
      !fallbackKeys.groq &&
      !fallbackKeys.openai &&
      !fallbackKeys.anthropic &&
      !fallbackKeys.openrouter
    ) {
      return "Scheduled task requires at least one LLM API key in the server environment.";
    }

    // Get memory context for the user
    const memoryContext = await memoryManager.getRelevantContext(
      task.userId,
      task.prompt,
    );

    // Enrich prompt with memory context
    const enrichedPrompt = memoryContext
      ? `[User Context]\n${memoryContext}\n\n[Scheduled Task]\n${task.prompt}`
      : task.prompt;

    // Add date/time context
    const now = new Date();
    const timeContext = `Current time: ${now.toISOString()} (${now.toLocaleString("en-US", { weekday: "long", hour: "2-digit", minute: "2-digit" })})`;

    const fullPrompt = `${timeContext}\n\n${enrichedPrompt}`;

    const model = createLLM(fallbackKeys, "default");
    let result = "";
    await streamResponse(
      model,
      [{ role: "user", content: fullPrompt }],
      (token: string) => {
        result += token;
      },
    );

    // Store as episode
    await memoryManager.addEpisode({
      userId: task.userId,
      summary: `Scheduled task "${task.name}" completed`,
      keyFacts: [result.slice(0, 200)],
      topics: ["scheduled", task.name],
    });

    const durationMs = Date.now() - startTime;
    log.info(
      { taskId, taskName: task.name, durationMs },
      "Task completed successfully",
    );

    return result;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    log.error(
      { taskId, taskName: task.name, err, durationMs },
      "Task execution failed",
    );

    // Retry logic
    if (retryCount < DEFAULT_RETRY.maxRetries) {
      const delay = Math.min(
        DEFAULT_RETRY.backoffMs * Math.pow(2, retryCount),
        DEFAULT_RETRY.maxBackoffMs,
      );
      log.info(
        { taskId, retryCount: retryCount + 1, delayMs: delay },
        "Retrying task",
      );
      await new Promise((r) => setTimeout(r, delay));
      return executeTask(task, retryCount + 1);
    }

    return `Error after ${DEFAULT_RETRY.maxRetries} retries: ${err.message}`;
  } finally {
    runningTasks.delete(taskId);
  }
}

/**
 * Schedule a single task
 */
export function scheduleTask(task: any): void {
  const cronExpr = task.cronExpression || task.cron;
  if (!cron.validate(cronExpr)) {
    log.warn({ taskId: task._id, cron: cronExpr }, "Invalid cron expression");
    return;
  }

  const job = cron.schedule(cronExpr, async () => {
    const taskId = task._id.toString();
    log.info({ taskId, name: task.name }, "Running scheduled task");

    const result = await executeTask(task);

    // Update DB
    try {
      await ScheduledTask.findByIdAndUpdate(taskId, {
        lastRun: new Date(),
        lastResult: result.slice(0, 2000),
        $inc: { runCount: 1 },
      });
    } catch (err: any) {
      log.error({ taskId, err }, "Failed to update task result");
    }
  });

  activeJobs.set(task._id.toString(), job);
  log.info(
    { taskId: task._id, name: task.name, cron: cronExpr },
    "Task scheduled",
  );
}

/**
 * Unschedule a task by ID
 */
export function unscheduleTask(taskId: string): void {
  const job = activeJobs.get(taskId);
  if (job) {
    job.stop();
    activeJobs.delete(taskId);
    log.info({ taskId }, "Task unscheduled");
  }
}

/**
 * Load all enabled tasks from DB and start them
 */
export async function initScheduler(): Promise<void> {
  try {
    const tasks = await ScheduledTask.find({ enabled: true });
    log.info({ count: tasks.length }, "Loading scheduled tasks");
    for (const task of tasks) {
      scheduleTask(task);
    }
  } catch (err: any) {
    log.error({ err }, "Failed to initialize scheduler");
  }
}

/**
 * Reload a task (unschedule + reschedule) after updates
 */
export async function reloadTask(taskId: string): Promise<void> {
  unscheduleTask(taskId);
  const task = await ScheduledTask.findById(taskId);
  if (task && task.enabled) {
    scheduleTask(task);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  activeJobs: number;
  runningTasks: number;
  jobIds: string[];
} {
  return {
    activeJobs: activeJobs.size,
    runningTasks: runningTasks.size,
    jobIds: Array.from(activeJobs.keys()),
  };
}
