import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: string;
}

const sprintSchema = new Schema<ISprint>({
  name: { type: String, required: true },
  projectId: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, default: 'active' } // upcoming, active, completed
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

export const Sprint = mongoose.model<ISprint>('Sprint', sprintSchema);
