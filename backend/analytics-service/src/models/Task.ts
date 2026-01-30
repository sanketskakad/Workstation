import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  project: string;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  status: { type: String, default: 'todo' },
  priority: { type: String, default: 'medium' },
  assignee: { type: String, required: true },
  dueDate: { type: String },
  project: { type: String, default: 'General' }
}, { timestamps: true });

export const Task = mongoose.model<ITask>('Task', taskSchema);
