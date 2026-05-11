import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/roles.js';

export const authRoutes = Router();

authRoutes.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(Object.values(ROLES))
  ],
  validate,
  register
);

authRoutes.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], validate, login);
authRoutes.get('/me', authenticate, me);
