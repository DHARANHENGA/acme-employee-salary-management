/**
 * Typed application errors.
 * Thrown by services/repositories and handled centrally by the error-handler middleware.
 */

export type ErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_INACTIVE'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly httpStatus: number
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404);
  }
}

export class AlreadyInactiveError extends AppError {
  constructor(message = 'Employee is already inactive') {
    super('ALREADY_INACTIVE', message, 409);
  }
}
