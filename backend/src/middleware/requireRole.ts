import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import { RoleCode } from '../types/index.js';

/** Middleware to enforce Role-Based Access Control (RBAC) */
export function requireRole(allowedRoles: RoleCode[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized: User not authenticated', 401));
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new AppError('Forbidden: Insufficient role permissions', 403));
    }

    next();
  };
}
