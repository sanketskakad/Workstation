import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamObjective: String,
  details: String,
  ownerId: { type: String, required: true },
  members: [String]
});

export const Project = mongoose.model('Project', projectSchema);
