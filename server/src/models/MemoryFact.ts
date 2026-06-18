import mongoose, { Schema, Document } from "mongoose";

export interface IMemoryFact extends Document {
  userId: string;
  key: string;
  value: string;
  confidence: number; // 0-1
  source: "conversation" | "explicit" | "inferred" | "profile";
  embedding?: number[];
  firstSeen: Date;
  lastConfirmed: Date;
  contradictedBy?: string;
  expiresAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MemoryFactSchema = new Schema<IMemoryFact>(
  {
    userId: { type: String, required: true, index: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
    confidence: { type: Number, default: 0.7, min: 0, max: 1 },
    source: {
      type: String,
      enum: ["conversation", "explicit", "inferred", "profile"],
      default: "conversation",
    },
    embedding: [Number],
    firstSeen: { type: Date, default: Date.now },
    lastConfirmed: { type: Date, default: Date.now },
    contradictedBy: { type: String },
    expiresAt: { type: Date },
    tags: [String],
  },
  { timestamps: true },
);

MemoryFactSchema.index({ userId: 1, key: 1 }, { unique: true });
MemoryFactSchema.index({ userId: 1, confidence: -1 });
MemoryFactSchema.index({ userId: 1, expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MemoryFact = mongoose.model<IMemoryFact>(
  "MemoryFact",
  MemoryFactSchema,
);
