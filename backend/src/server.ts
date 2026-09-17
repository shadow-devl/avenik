import { requireAuth } from './middleware/requireAuth.js';
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
import schemeMatcherRouter from './routes/opportunity-discovery.js';
import nbaRouter from './routes/nba.js';
import businessHealthRouter from './routes/businessHealth.js';
import forecastsRouter from './routes/forecasts.js';
import warningsRouter from './routes/warnings.js';
import recommendationsRouter from './routes/recommendations.js';
import decisionsRouter from './routes/decisions.js';
import memoryRouter from './routes/memory.js';
import timelineRouter from './routes/timeline.js';
import graphRouter from './routes/graph.js';
import fundingRouter from './routes/funding.js';
import { financeRouter } from './routes/finance.js';
import trustRouter from './routes/trust.js';
import fraudRouter from './routes/fraud.js';
import goalsRouter from './routes/goals.js';
import actionsRouter from './routes/actions.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { ecosystemRouter } from './routes/ecosystem.js';
import { maturityRouter } from './routes/maturity.js';
import { evolutionRouter } from './routes/evolution.js';
import { customerIntelligenceRouter } from './routes/customer-intelligence.js';
import { globalPlatformRouter } from './routes/global-platform.js';
import { webhookRouter } from './routes/webhooks.js';
import { integrationsRouter } from './routes/integrations.js';
import { marketIntelligenceRouter } from './routes/market-intelligence.js';
import { financialIntelligenceRouter } from './routes/financial-intelligence.js';
import { workforceRouter } from './routes/workforce.js';
import { schemeSuccessRouter } from './routes/scheme-success.js';
import { decisionIntelligenceRouter } from './routes/decision-intelligence.js';
import { marketingIntelligenceRouter } from './routes/marketing-intelligence.js';
import { businessIntelligenceRouter } from './routes/business-intelligence.js';
import { resourceIntelligenceRouter } from './routes/resource-intelligence.js';
import { advancedSupportRouter } from './routes/advanced-government-support-execution.js';
import { trustedIntelligenceRouter } from './routes/avenik-trusted-intelligence.js';
import { unifiedWorkspaceRouter } from './routes/unified-workspace.js';
import { revenueOperationsRouter } from './routes/entrepreneur-revenue-operations.js';
import { customerExperienceRouter } from './routes/customer-experience-intelligence.js';
import { operationsIntelligenceRouter } from './routes/operations-intelligence.js';
import { genericIntelligenceRouter } from './routes/generic-intelligence.js';
import { aiRouter } from './routes/ai.js';
import { profileRouter } from './routes/profile.js';

const app = express();

// ── Security ─────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-business-id', 'x-organization-id', 'x-role-id'],
}));

// ── Parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────
app.use(morgan('dev'));

// ── Routes ───────────────────────────────────────
import businessRouter from './routes/business.js';
import { customerLifecycleOrchestrationRouter } from './routes/customer-lifecycle-orchestration.js';
import { partnerRouter } from './routes/partner.js';
import { productManagementRouter } from './routes/product-management.js';
import { sustainabilityRouter } from './routes/sustainability.js';
import { productionHubRouter } from './routes/production-hub.js';
import { legalRouter } from './routes/legal.js';
import { humanCapitalIntelligenceRouter } from './routes/human-capital-intelligence.js';

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/business', businessRouter);
app.use('/api/context', contextEngineRouter);
app.use('/api/opportunities', requireAuth, schemeMatcherRouter);
app.use('/api/nba', requireAuth, nbaRouter);
app.use('/api/health-engine', businessHealthRouter);
app.use('/api/forecasts', requireAuth, forecastsRouter);
app.use('/api/warnings', requireAuth, warningsRouter);
app.use('/api/recommendations', requireAuth, recommendationsRouter);
app.use('/api/decisions', requireAuth, decisionsRouter);
app.use('/api/memory', requireAuth, memoryRouter);
app.use('/api/timeline', requireAuth, timelineRouter);
app.use('/api/graph', requireAuth, graphRouter);
app.use('/api/funding', requireAuth, fundingRouter);
app.use('/api/finance', requireAuth, financeRouter);
app.use('/api/trust', requireAuth, trustRouter);
app.use('/api/fraud', requireAuth, fraudRouter);
app.use('/api/goals', requireAuth, goalsRouter);
app.use('/api/actions', requireAuth, actionsRouter);
app.use('/api/intelligence', requireAuth, intelligenceRouter);
app.use('/api/maturity', requireAuth, maturityRouter);
app.use('/api/evolution', requireAuth, evolutionRouter);
app.use('/api/customer', requireAuth, customerIntelligenceRouter);
app.use('/api/operations', requireAuth, operationsIntelligenceRouter);
app.use('/api/market', requireAuth, marketIntelligenceRouter);
app.use('/api/financial-intelligence', requireAuth, financialIntelligenceRouter);
app.use('/api/workforce', requireAuth, workforceRouter);
app.use('/api/scheme-success', requireAuth, schemeSuccessRouter);
app.use('/api/decision-intelligence', requireAuth, decisionIntelligenceRouter);
app.use('/api/marketing-intelligence', requireAuth, marketingIntelligenceRouter);
app.use('/api/business-intelligence', requireAuth, businessIntelligenceRouter);
app.use('/api/resource-intelligence', requireAuth, resourceIntelligenceRouter);
app.use('/api/advanced-government-support', requireAuth, advancedSupportRouter);
app.use('/api/trusted-intelligence', requireAuth, trustedIntelligenceRouter);
app.use('/api/unified-workspace', requireAuth, unifiedWorkspaceRouter);
app.use('/api/revenue-operations', requireAuth, revenueOperationsRouter);
app.use('/api/customer-experience', requireAuth, customerExperienceRouter);
app.use('/api/operations-intelligence', requireAuth, operationsIntelligenceRouter);
app.use('/api/generic-intelligence', requireAuth, genericIntelligenceRouter);
app.use('/api/ai', requireAuth, aiRouter);
app.use('/api/profile', requireAuth, profileRouter);
app.use('/api/global', requireAuth, globalPlatformRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/integrations', requireAuth, integrationsRouter);
app.use('/api/customer-lifecycle-orchestration', requireAuth, customerLifecycleOrchestrationRouter);
app.use('/api/partner', requireAuth, partnerRouter);
app.use('/api/product-management', requireAuth, productManagementRouter);
app.use('/api/sustainability', requireAuth, sustainabilityRouter);
app.use('/api/production-hub', requireAuth, productionHubRouter);
app.use('/api/legal', requireAuth, legalRouter);
app.use('/api/human-capital-intelligence', requireAuth, humanCapitalIntelligenceRouter);

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


