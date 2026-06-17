import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  plan: "free" | "pro" | "team";
  teamId?: string;
  settings: {
    preferredModel: string;
    voiceEnabled: boolean;
    voicePersonality: string;
    ttsEngine: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true },
  plan: { type: String, enum: ["free", "pro", "team"], default: "free" },
  teamId: { type: String },
  settings: {
    preferredModel: { type: String, default: "gemini-flash" },
    voiceEnabled: { type: Boolean, default: false },
    voicePersonality: { type: String, default: "nova" },
    ttsEngine: { type: String, default: "browser" },
  },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", UserSchema);
