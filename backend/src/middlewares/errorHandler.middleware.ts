import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/customErrors';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCodes } from '../constants/httpStatuses';
import { logger } from '../config/logger.config';
import { env } from '../config/env.config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response => {
  if (err instanceof AppError) {
    logger.warn({
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method
    }, 'Operational Domain Error Captured');

    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Unhandled Exception (500)
  logger.error({
    err,
    path: req.path,
    method: req.method,
    stack: err.stack
  }, 'Unhandled Server Exception Captured');

  const message = env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, HttpStatusCodes.INTERNAL_SERVER_ERROR);
};
