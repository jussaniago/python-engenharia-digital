import { Project } from '../models/Project.js';
import { Model } from '../models/Model.js';
import { ModelVersion } from '../models/ModelVersion.js';
import { Issue } from '../models/Issue.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().populate('userId', 'name email').sort({ createdAt: -1 });
  return res.json(projects);
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({ name: req.body.name, userId: req.user.id });
  return res.status(201).json(project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.projectId, { name: req.body.name }, { new: true });
  if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });
  return res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

  const models = await Model.find({ projectId: project.id }).select('_id');
  const modelIds = models.map((model) => model.id);
  await Promise.all([
    Issue.deleteMany({ projectId: project.id }),
    ModelVersion.deleteMany({ modelId: { $in: modelIds } }),
    Model.deleteMany({ projectId: project.id }),
    Project.deleteOne({ _id: project.id })
  ]);

  return res.status(204).send();
});
