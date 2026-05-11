import multer from 'multer';
import { Router } from 'express';
import { body } from 'express-validator';
import { listModels, listVersions, manifest, setActiveVersion, uploadModelVersion } from '../controllers/modelController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/roles.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 1024 } });
export const modelRoutes = Router();

modelRoutes.use(authenticate);
modelRoutes.get('/projects/:projectId/models', listModels);
modelRoutes.get('/:modelId/versions', listVersions);
modelRoutes.get('/versions/:versionId/manifest', manifest);
modelRoutes.post(
  '/upload',
  authorize(ROLES.ADMIN),
  upload.single('file'),
  [body('projectId').isMongoId(), body('modelId').optional().isMongoId(), body('name').optional().trim().isLength({ min: 2 })],
  validate,
  uploadModelVersion
);
modelRoutes.patch('/versions/:versionId/active', authorize(ROLES.ADMIN), setActiveVersion);
