import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  userId: string;
  teamId?: string;
  title: string;
  content: string;
  tags: string[];
  embedding?: number[];
  visibility: "private" | "team";
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  userId: { type: String, required: true, index: true },
  teamId: { type: String },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  embedding: [Number],
  visibility: { type: String, enum: ["private", "team"], default: "private" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

NoteSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Note = mongoose.model<INote>("Note", NoteSchema);
