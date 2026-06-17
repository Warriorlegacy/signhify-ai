import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentId?: string;
  toolCallId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface IThread extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  agentsInvoked: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  threadId: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "assistant", "system", "tool"],
    required: true,
  },
  content: { type: String, required: true },
  agentId: { type: String },
  toolCallId: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
});

const ThreadSchema = new Schema<IThread>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  agentsInvoked: [String],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ThreadSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Thread = mongoose.model<IThread>("Thread", ThreadSchema);
