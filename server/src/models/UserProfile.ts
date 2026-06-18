import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: string;
  identity: {
    name?: string;
    timezone?: string;
    language: string;
    preferredProvider?: string;
    preferredModel?: string;
  };
  preferences: Record<string, unknown>;
  context: {
    currentProjects: string[];
    recurringTasks: string[];
    importantPeople: string[];
  };
  goals: Array<{
    id: string;
    description: string;
    status: "active" | "completed" | "archived";
    createdAt: Date;
  }>;
  interactionStats: {
    totalMessages: number;
    totalSessions: number;
    avgSessionLength: number;
    topAgents: string[];
    lastActiveAt?: Date;
  };
  embedding?: number[];
  lastRegenerated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    identity: {
      name: String,
      timezone: String,
      language: { type: String, default: "en" },
      preferredProvider: String,
      preferredModel: String,
    },
    preferences: { type: Schema.Types.Mixed, default: {} },
    context: {
      currentProjects: [String],
      recurringTasks: [String],
      importantPeople: [String],
    },
    goals: [
      {
        id: String,
        description: String,
        status: { type: String, enum: ["active", "completed", "archived"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    interactionStats: {
      totalMessages: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      avgSessionLength: { type: Number, default: 0 },
      topAgents: [String],
      lastActiveAt: Date,
    },
    embedding: [Number],
    lastRegenerated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const UserProfile = mongoose.model<IUserProfile>(
  "UserProfile",
  UserProfileSchema,
);
