import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler.js';

/** Validate request body/query/params against a Zod schema */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(issue.message);
        }
        next(new AppError('Validation failed', 400, fieldErrors));
      } else {
        next(error);
      }
    }
  };
}
