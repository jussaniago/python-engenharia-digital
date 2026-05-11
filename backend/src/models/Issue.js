import mongoose from 'mongoose';
import { ISSUE_STATUS } from '../utils/roles.js';

const issueSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true, index: true },
    versionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ModelVersion', required: true, index: true },
    elementId: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true }
    },
    cameraState: { type: mongoose.Schema.Types.Mixed, required: true },
    screenshot: { type: String },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(ISSUE_STATUS), default: ISSUE_STATUS.OPEN },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const Issue = mongoose.model('Issue', issueSchema);
