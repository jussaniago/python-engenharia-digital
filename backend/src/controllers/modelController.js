import { Model } from '../models/Model.js';
import { ModelVersion } from '../models/ModelVersion.js';
import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getManifest, translateObject, uploadObject } from '../services/apsService.js';

async function nextVersion(modelId) {
  const count = await ModelVersion.countDocuments({ modelId });
  return `v${count + 1}`;
}

export const listModels = asyncHandler(async (req, res) => {
  const models = await Model.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
  return res.json(models);
});

export const listVersions = asyncHandler(async (req, res) => {
  const versions = await ModelVersion.find({ modelId: req.params.modelId })
    .populate('uploadedBy', 'name email')
    .sort({ uploadDate: -1 });
  return res.json(versions);
});

export const uploadModelVersion = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Arquivo .nwd é obrigatório.' });
  if (!req.file.originalname.toLowerCase().endsWith('.nwd')) {
    return res.status(422).json({ message: 'Apenas arquivos Navisworks .NWD são aceitos.' });
  }

  const project = await Project.findById(req.body.projectId);
  if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

  const model = req.body.modelId
    ? await Model.findById(req.body.modelId)
    : await Model.create({ projectId: project.id, userId: req.user.id, name: req.body.name || req.file.originalname });

  if (!model || String(model.projectId) !== String(project.id)) {
    return res.status(404).json({ message: 'Modelo não encontrado neste projeto.' });
  }

  await ModelVersion.updateMany({ modelId: model.id }, { isActive: false });
  const upload = await uploadObject(req.file);
  await translateObject(upload.urn);

  const version = await ModelVersion.create({
    modelId: model.id,
    version: await nextVersion(model.id),
    urn: upload.urn,
    objectKey: upload.objectKey,
    fileName: req.file.originalname,
    uploadedBy: req.user.id,
    isActive: true,
    translationStatus: 'requested'
  });

  return res.status(201).json({ model, version });
});

export const setActiveVersion = asyncHandler(async (req, res) => {
  const version = await ModelVersion.findById(req.params.versionId);
  if (!version) return res.status(404).json({ message: 'Versão não encontrada.' });

  await ModelVersion.updateMany({ modelId: version.modelId }, { isActive: false });
  version.isActive = true;
  await version.save();
  return res.json(version);
});

export const manifest = asyncHandler(async (req, res) => {
  const version = await ModelVersion.findById(req.params.versionId);
  if (!version) return res.status(404).json({ message: 'Versão não encontrada.' });
  const data = await getManifest(version.urn);
  version.translationStatus = data.status || version.translationStatus;
  await version.save();
  return res.json(data);
});
