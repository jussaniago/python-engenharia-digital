import { Router } from 'express';
import { body } from 'express-validator';
import { addComment, createIssue, deleteIssue, listIssues, updateIssue } from '../controllers/issueController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ISSUE_STATUS } from '../utils/roles.js';

export const issueRoutes = Router();

issueRoutes.use(authenticate);
issueRoutes.get('/', listIssues);
issueRoutes.post(
  '/',
  [
    body('projectId').isMongoId(),
    body('modelId').isMongoId(),
    body('versionId').isMongoId(),
    body('elementId').notEmpty(),
    body('position.x').isNumeric(),
    body('position.y').isNumeric(),
    body('position.z').isNumeric(),
    body('cameraState').isObject(),
    body('title').trim().isLength({ min: 2 }),
    body('description').trim().isLength({ min: 2 }),
    body('status').optional().isIn(Object.values(ISSUE_STATUS)),
    body('assignedTo').optional({ nullable: true }).isMongoId()
  ],
  validate,
  createIssue
);
issueRoutes.put('/:issueId', updateIssue);
issueRoutes.delete('/:issueId', deleteIssue);
issueRoutes.post('/:issueId/comments', [body('message').trim().isLength({ min: 1 })], validate, addComment);
