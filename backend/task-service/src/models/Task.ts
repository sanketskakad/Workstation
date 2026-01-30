import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  project: string; // Deprecated, keep for backward compatibility
  projectId?: string;
  sprintId?: string;
  subtasks: string[];
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'todo' },
  priority: { type: String, default: 'medium' },
  assignee: { type: String, required: true },
  dueDate: { type: String },
  project: { type: String, default: 'General' },
  projectId: { type: String },
  sprintId: { type: String },
  subtasks: { type: [String], default: [] }
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

export const Task = mongoose.model<ITask>('Task', taskSchema);
