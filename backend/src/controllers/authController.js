import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/roles.js';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function serializeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'E-mail já cadastrado.' });

  const isFirstUser = (await User.countDocuments()) === 0;
  const user = await User.create({
    name,
    email,
    password,
    role: isFirstUser ? ROLES.ADMIN : role || ROLES.VIEWER
  });

  return res.status(201).json({ token: signToken(user), user: serializeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  return res.json({ token: signToken(user), user: serializeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: serializeUser(req.user) });
});
