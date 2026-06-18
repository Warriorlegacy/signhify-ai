import mongoose, { Schema, Document } from "mongoose";

export interface IMemoryEpisode extends Document {
  userId: string;
  threadId?: string;
  summary: string;
  participants: string[];
  keyFacts: string[];
  sentiment?: "positive" | "negative" | "neutral" | "mixed";
  topics: string[];
  embedding?: number[];
  timestamp: Date;
  createdAt: Date;
}

const MemoryEpisodeSchema = new Schema<IMemoryEpisode>(
  {
    userId: { type: String, required: true, index: true },
    threadId: { type: String },
    summary: { type: String, required: true },
    participants: [String],
    keyFacts: [String],
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral", "mixed"],
    },
    topics: [String],
    embedding: [Number],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

MemoryEpisodeSchema.index({ userId: 1, timestamp: -1 });
MemoryEpisodeSchema.index({ userId: 1, topics: 1 });

export const MemoryEpisode = mongoose.model<IMemoryEpisode>(
  "MemoryEpisode",
  MemoryEpisodeSchema,
);
