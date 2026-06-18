import { createContextLogger } from "../lib/logger";
import { cacheGet, cacheSet, cacheDel } from "../lib/redis";
import { Skill, ISkill, ISkillStep } from "../models/Skill";

const log = createContextLogger("skill-registry");

export interface SkillExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  durationMs: number;
}

export class SkillRegistry {
  // ─── CRUD ─────────────────────────────────────────────────────────

  async create(
    userId: string,
    data: {
      name: string;
      description: string;
      kind?: "tool-sequence" | "prompt-template" | "workflow";
      triggerPhrases?: string[];
      steps?: ISkillStep[];
      tags?: string[];
      isPublic?: boolean;
      approvalStatus?: string;
      createdBy?: "user" | "agent";
      sourceThreadId?: string;
      safetyLevel?: "safe" | "moderate" | "dangerous";
    },
  ): Promise<ISkill> {
    const skill = await Skill.create({
      userId,
      ...data,
      isApproved:
        data.approvalStatus === "auto-approved" ||
        data.approvalStatus === "approved",
    });

    await cacheDel(`skills:${userId}`);
    log.info({ userId, skillId: skill._id, name: skill.name }, "Skill created");
    return skill;
  }

  async getById(userId: string, skillId: string): Promise<ISkill | null> {
    return Skill.findOne({ _id: skillId, userId });
  }

  async list(userId: string): Promise<ISkill[]> {
    const cacheKey = `skills:${userId}`;
    const cached = await cacheGet<ISkill[]>(cacheKey);
    if (cached) return cached;

    const skills = await Skill.find({ userId }).sort({ usageCount: -1 });
    await cacheSet(cacheKey, skills, 300);
    return skills;
  }

  async update(
    userId: string,
    skillId: string,
    updates: Partial<
      Pick<
        ISkill,
        | "name"
        | "description"
        | "triggerPhrases"
        | "steps"
        | "tags"
        | "isPublic"
        | "safetyLevel"
        | "version"
      >
    >,
  ): Promise<ISkill | null> {
    const skill = await Skill.findOneAndUpdate(
      { _id: skillId, userId },
      { $set: updates },
      { new: true },
    );
    if (skill) await cacheDel(`skills:${userId}`);
    return skill;
  }

  async delete(userId: string, skillId: string): Promise<boolean> {
    const result = await Skill.findOneAndDelete({ _id: skillId, userId });
    if (result) {
      await cacheDel(`skills:${userId}`);
      return true;
    }
    return false;
  }

  // ─── Approval Workflow ────────────────────────────────────────────

  async approve(userId: string, skillId: string): Promise<ISkill | null> {
    const skill = await Skill.findOneAndUpdate(
      { _id: skillId, userId },
      { $set: { approvalStatus: "approved", isApproved: true } },
      { new: true },
    );
    if (skill) await cacheDel(`skills:${userId}`);
    return skill;
  }

  async reject(userId: string, skillId: string): Promise<ISkill | null> {
    const skill = await Skill.findOneAndUpdate(
      { _id: skillId, userId },
      { $set: { approvalStatus: "rejected", isApproved: false } },
      { new: true },
    );
    if (skill) await cacheDel(`skills:${userId}`);
    return skill;
  }

  // ─── Execution Tracking ───────────────────────────────────────────

  async recordUsage(
    skillId: string,
    success: boolean,
    durationMs: number,
  ): Promise<void> {
    const update: Record<string, unknown> = {
      $inc: {
        usageCount: 1,
        ...(success ? { successCount: 1 } : { failureCount: 1 }),
      },
      $set: {
        lastUsedAt: new Date(),
        ...(success
          ? { lastSuccessAt: new Date() }
          : { lastFailureAt: new Date() }),
      },
    };

    // Update rolling average execution time
    const skill = await Skill.findById(skillId);
    if (skill) {
      const totalRuns = skill.usageCount + 1;
      const avgMs = skill.avgExecutionMs
        ? (skill.avgExecutionMs * skill.usageCount + durationMs) / totalRuns
        : durationMs;
      update.avgExecutionMs = avgMs;
    }

    await Skill.findByIdAndUpdate(skillId, update);
  }

  async recordError(
    skillId: string,
    error: string,
    input?: string,
  ): Promise<void> {
    await Skill.findByIdAndUpdate(skillId, {
      $push: {
        errorLog: {
          $each: [{ timestamp: new Date(), error, input }],
          $slice: -50, // keep last 50 errors
        },
      },
    });
  }

  // ─── Skill Matching ───────────────────────────────────────────────

  async findMatchingSkill(
    userId: string,
    query: string,
  ): Promise<ISkill | null> {
    const skills = await this.list(userId);
    const q = query.toLowerCase();

    // Score each skill by trigger phrase match
    let bestMatch: ISkill | null = null;
    let bestScore = 0;

    for (const skill of skills) {
      if (!skill.isApproved) continue;

      for (const phrase of skill.triggerPhrases) {
        const p = phrase.toLowerCase();
        if (q.includes(p) || p.includes(q)) {
          const score =
            Math.min(p.length, q.length) / Math.max(p.length, q.length);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = skill;
          }
        }
      }
    }

    return bestScore > 0.5 ? bestMatch : null;
  }

  // ─── Skill Synthesis (from execution trace) ───────────────────────

  async synthesizeFromTrace(params: {
    userId: string;
    taskDescription: string;
    executionSteps: string[];
    output: string;
    agentType: string;
    sourceThreadId?: string;
  }): Promise<ISkill> {
    // Auto-generate skill metadata from trace
    const name = this.generateSkillName(params.taskDescription);
    const description = `Auto-generated skill from: ${params.taskDescription.slice(0, 100)}`;

    const steps: ISkillStep[] = params.executionSteps.map((step, i) => ({
      order: i + 1,
      kind: "llm" as const,
      description: step,
      prompt: step,
    }));

    // Determine safety level based on content
    const safetyLevel = this.assessSafetyLevel(params.executionSteps);

    return this.create(params.userId, {
      name,
      description,
      kind: "workflow",
      triggerPhrases: this.generateTriggerPhrases(params.taskDescription),
      steps,
      tags: [params.agentType, "auto-generated"],
      approvalStatus: safetyLevel === "dangerous" ? "pending" : "auto-approved",
      createdBy: "agent",
      sourceThreadId: params.sourceThreadId,
      safetyLevel,
    });
  }

  private generateSkillName(description: string): string {
    const words = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .slice(0, 5);
    return words.join("-") || "unnamed-skill";
  }

  private generateTriggerPhrases(description: string): string[] {
    const phrases: string[] = [description.toLowerCase()];
    // Extract key verbs/nouns for matching
    const words = description.toLowerCase().split(/\s+/);
    if (words.length > 3) {
      phrases.push(words.slice(0, 3).join(" "));
    }
    return phrases;
  }

  private assessSafetyLevel(
    steps: string[],
  ): "safe" | "moderate" | "dangerous" {
    const dangerous = [
      "rm ",
      "delete",
      "drop",
      "exec",
      "eval",
      "shell",
      "sudo",
      "format",
    ];
    const moderate = ["write", "update", "create", "send", "post", "publish"];

    const allText = steps.join(" ").toLowerCase();

    if (dangerous.some((d) => allText.includes(d))) return "dangerous";
    if (moderate.some((m) => allText.includes(m))) return "moderate";
    return "safe";
  }
}

export const skillRegistry = new SkillRegistry();
