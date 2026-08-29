import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/errors/app-error';

/**
 * Centralised error handling middleware.
 * Must be registered last in the Express app after all routes.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.');
      fieldErrors[field] = issue.message;
    }
    res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      data: fieldErrors,
    });
    return;
  }

  // Known application errors (NOT_FOUND, ALREADY_INACTIVE, etc.)
  if (err instanceof AppError || (err && typeof err === 'object' && 'httpStatus' in err && 'code' in err)) {
    const appErr = err as AppError;
    res.status(appErr.httpStatus).json({
      status: 'error',
      code: appErr.code,
      message: appErr.message,
      data: null,
    });
    return;
  }

  // Unknown / unexpected errors — log and return 500
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    data: null,
  });
}
