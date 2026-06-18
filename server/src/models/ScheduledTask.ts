import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledTask extends Document {
  userId: string;
  name: string;
  description?: string;
  cronExpression: string;
  prompt: string;
  agentType?: string;
  enabled: boolean;
  lastRun?: Date;
  lastResult?: string;
  nextRun?: Date;
  runCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledTaskSchema = new Schema<IScheduledTask>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    cronExpression: { type: String, required: true },
    prompt: { type: String, required: true },
    agentType: { type: String },
    enabled: { type: Boolean, default: true },
    lastRun: { type: Date },
    lastResult: { type: String },
    nextRun: { type: Date },
    runCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ScheduledTaskSchema.index({ userId: 1, enabled: 1 });

export const ScheduledTask = mongoose.model<IScheduledTask>(
  "ScheduledTask",
  ScheduledTaskSchema
);
