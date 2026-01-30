import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  bio?: string;
  password?: string;
  role: string;
  team: string[];
  googleId?: string;
  settings?: {
    defaultView?: string;
    timezone?: string;
    autoSave?: boolean;
    compactMode?: boolean;
    theme?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    password: { type: String },
    role: { type: String, default: "Developer" },
    team: { type: [String], default: [] },
    googleId: { type: String },
    settings: {
      type: Object,
      default: {
        defaultView: "Kanban Board",
        timezone: "UTC",
        autoSave: true,
        compactMode: false,
        theme: "dark",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
