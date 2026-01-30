import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  teamObjective: string;
  details: string;
  ownerId: string; // Map to user email or ID
  members: string[]; // List of user emails or IDs
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  teamObjective: { type: String, required: true },
  details: { type: String, default: '' },
  ownerId: { type: String, required: true },
  members: { type: [String], default: [] }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
