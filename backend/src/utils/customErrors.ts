import { HttpStatusCodes, HttpStatusCode } from '../constants/httpStatuses';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR,
    errors?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors?: Array<{ field?: string; message: string }>) {
    super(message, HttpStatusCodes.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, HttpStatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden action') {
    super(message, HttpStatusCodes.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested entity not found') {
    super(message, HttpStatusCodes.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Entity resource conflict') {
    super(message, HttpStatusCodes.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(errors: Array<{ field?: string; message: string }>, message = 'Validation failed') {
    super(message, HttpStatusCodes.UNPROCESSABLE_ENTITY, errors);
  }
}
