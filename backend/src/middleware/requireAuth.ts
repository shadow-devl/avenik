import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { config } from '../config/index.js';
import { AuthTokenPayload } from '../types/index.js';

// Extend Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/** Middleware to verify JWT token and attach user to request */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing or invalid token', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Unauthorized: Token expired', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Unauthorized: Invalid token', 401));
    } else {
      next(error);
    }
  }
}
