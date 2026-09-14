import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import organizationsRouter from './routes/organizations.js';
import contextEngineRouter from './routes/contextEngine.js';
import schemeMatcherRouter from './routes/government-scheme-matching-accuracy.js';
import nbaRouter from './routes/nba.js';
import businessHealthRouter from './routes/businessHealth.js';



const app = express();

// ── Security ─────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────
app.use(morgan('dev'));

// ── Routes ───────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/context', contextEngineRouter);
app.use('/api/schemes/match', schemeMatcherRouter);
app.use('/api/nba', nbaRouter);
app.use('/api/health-engine', businessHealthRouter);



// ── 404 Handler ──────────────────────────────────
app.use((_req, _res, next) => {
  next(new AppError('Route not found', 404));
});

// ── Error Handler ────────────────────────────────
app.use(errorHandler);

// ── Server ───────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info(`🚀 Avenik Backend running on port ${config.port}`);
  logger.info(`   Environment: ${config.nodeEnv}`);
  logger.info(`   CORS origin: ${config.corsOrigin}`);
});

// ── Graceful Shutdown ────────────────────────────
const shutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;




