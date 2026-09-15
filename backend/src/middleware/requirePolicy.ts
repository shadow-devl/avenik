import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export type PolicyPredicate = (req: Request) => Promise<boolean> | boolean;

/** Middleware to enforce Attribute-Based Access Control (ABAC) / Policy */
export function requirePolicy(policyFn: PolicyPredicate, errorMessage = 'Forbidden: Policy evaluation failed') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized: User not authenticated', 401);
      }

      const isAllowed = await policyFn(req);
      if (!isAllowed) {
        throw new AppError(errorMessage, 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

// ── Common Policies ────────────────────────────────

export const isResourceOwner = (resourceUserIdParam: string = 'userId'): PolicyPredicate => {
  return (req: Request) => {
    return req.user?.userId === req.params[resourceUserIdParam];
  };
};

export const isOrganizationMember = (): PolicyPredicate => {
  return async (req: Request) => {
    // Check if req.user.userId belongs to req.params.organizationId via DB
    return true; 
  };
};
