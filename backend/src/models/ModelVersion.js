import mongoose from 'mongoose';

const modelVersionSchema = new mongoose.Schema(
  {
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true, index: true },
    version: { type: String, required: true },
    urn: { type: String, required: true },
    objectKey: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    translationStatus: { type: String, default: 'requested' }
  },
  { timestamps: true }
);

modelVersionSchema.index({ modelId: 1, version: 1 }, { unique: true });

export const ModelVersion = mongoose.model('ModelVersion', modelVersionSchema);
