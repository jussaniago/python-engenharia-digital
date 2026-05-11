import { Issue } from '../models/Issue.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/roles.js';

function issueAccessFilter(user) {
  return user.role === ROLES.ADMIN ? {} : { createdBy: user.id };
}

export const listIssues = asyncHandler(async (req, res) => {
  const filter = { ...issueAccessFilter(req.user) };
  ['projectId', 'modelId', 'versionId', 'status', 'assignedTo'].forEach((key) => {
    if (req.query[key]) filter[key] = req.query[key];
  });
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  const issues = await Issue.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  return res.json(issues);
});

export const createIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.create({ ...req.body, createdBy: req.user.id });
  return res.status(201).json(issue);
});

export const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.issueId);
  if (!issue) return res.status(404).json({ message: 'Issue não encontrada.' });
  if (req.user.role !== ROLES.ADMIN && String(issue.createdBy) !== String(req.user.id)) {
    return res.status(403).json({ message: 'Você só pode editar suas próprias issues.' });
  }

  const allowed = ['title', 'description', 'status', 'assignedTo', 'position', 'cameraState', 'screenshot'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) issue[field] = req.body[field];
  });
  await issue.save();
  return res.json(issue);
});

export const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.issueId);
  if (!issue) return res.status(404).json({ message: 'Issue não encontrada.' });
  if (req.user.role !== ROLES.ADMIN && String(issue.createdBy) !== String(req.user.id)) {
    return res.status(403).json({ message: 'Você só pode excluir suas próprias issues.' });
  }
  await Issue.deleteOne({ _id: issue.id });
  return res.status(204).send();
});

export const addComment = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.issueId);
  if (!issue) return res.status(404).json({ message: 'Issue não encontrada.' });
  issue.comments.push({ userId: req.user.id, message: req.body.message });
  await issue.save();
  return res.status(201).json(issue);
});
