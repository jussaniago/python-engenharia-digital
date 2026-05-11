import { Router } from 'express';
import { body } from 'express-validator';
import { createProject, deleteProject, listProjects, updateProject } from '../controllers/projectController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/roles.js';

export const projectRoutes = Router();

projectRoutes.use(authenticate);
projectRoutes.get('/', listProjects);
projectRoutes.post('/', authorize(ROLES.ADMIN), [body('name').trim().isLength({ min: 2 })], validate, createProject);
projectRoutes.put('/:projectId', authorize(ROLES.ADMIN), [body('name').trim().isLength({ min: 2 })], validate, updateProject);
projectRoutes.delete('/:projectId', authorize(ROLES.ADMIN), deleteProject);
