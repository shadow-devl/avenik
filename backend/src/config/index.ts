import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // CORS
  corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Redis
  redisUrl: process.env.REDIS_URL || '',
} as const;
