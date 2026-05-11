import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apsRoutes } from './routes/apsRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { issueRoutes } from './routes/issueRoutes.js';
import { modelRoutes } from './routes/modelRoutes.js';
import { projectRoutes } from './routes/projectRoutes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '20mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'bim-platform-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/aps', apsRoutes);

app.use((req, res) => res.status(404).json({ message: `Rota ${req.originalUrl} não encontrada.` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(error.status || 500).json({ message: error.message || 'Erro interno.' });
});
