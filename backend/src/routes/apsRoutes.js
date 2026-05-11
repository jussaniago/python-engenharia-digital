import { Router } from 'express';
import { viewerToken } from '../controllers/apsController.js';
import { authenticate } from '../middleware/auth.js';

export const apsRoutes = Router();

apsRoutes.use(authenticate);
apsRoutes.get('/token', viewerToken);
