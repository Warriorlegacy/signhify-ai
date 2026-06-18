import mongoose, { Schema, Document } from "mongoose";

export type SkillKind = "tool-sequence" | "prompt-template" | "workflow";

export interface ISkillStep {
  order: number;
  kind: "bash" | "llm" | "api" | "gateway" | "memory-query" | "condition";
  description: string;
  command?: string;
  args?: string[];
  prompt?: string;
  model?: string;
  apiRoute?: string;
  gateway?: "telegram" | "discord" | "cli" | "web";
  condition?: string;
  outputVar?: string;
}

export interface ISkill extends Document {
  userId: string;
  name: string;
  description: string;
  kind: SkillKind;
  version: string;
  triggerPhrases: string[];
  steps: ISkillStep[];
  tags: string[];
  isPublic: boolean;
  isApproved: boolean;
  approvalStatus: "pending" | "approved" | "rejected" | "auto-approved";
  createdBy: "user" | "agent";
  sourceThreadId?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  safetyLevel: "safe" | "moderate" | "dangerous";
  usageCount: number;
  successCount: number;
  failureCount: number;
  lastUsedAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  avgExecutionMs?: number;
  errorLog: Array<{
    timestamp: Date;
    error: string;
    input?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SkillStepSchema = new Schema<ISkillStep>(
  {
    order: { type: Number, required: true },
    kind: {
      type: String,
      enum: ["bash", "llm", "api", "gateway", "memory-query", "condition"],
      required: true,
    },
    description: { type: String, required: true },
    command: String,
    args: [String],
    prompt: String,
    model: String,
    apiRoute: String,
    gateway: { type: String, enum: ["telegram", "discord", "cli", "web"] },
    condition: String,
    outputVar: String,
  },
  { _id: false },
);

const SkillSchema = new Schema<ISkill>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    kind: {
      type: String,
      enum: ["tool-sequence", "prompt-template", "workflow"],
      default: "prompt-template",
    },
    version: { type: String, default: "1.0.0" },
    triggerPhrases: [String],
    steps: [SkillStepSchema],
    tags: [String],
    isPublic: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "auto-approved"],
      default: "pending",
    },
    createdBy: { type: String, enum: ["user", "agent"], default: "user" },
    sourceThreadId: String,
    inputSchema: Schema.Types.Mixed,
    outputSchema: Schema.Types.Mixed,
    safetyLevel: {
      type: String,
      enum: ["safe", "moderate", "dangerous"],
      default: "safe",
    },
    usageCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    lastUsedAt: Date,
    lastSuccessAt: Date,
    lastFailureAt: Date,
    avgExecutionMs: Number,
    errorLog: [
      {
        timestamp: Date,
        error: String,
        input: String,
      },
    ],
  },
  { timestamps: true },
);

SkillSchema.index({ userId: 1, name: 1 }, { unique: true });
SkillSchema.index({ userId: 1, triggerPhrases: 1 });
SkillSchema.index({ userId: 1, tags: 1 });

export const Skill = mongoose.model<ISkill>("Skill", SkillSchema);
