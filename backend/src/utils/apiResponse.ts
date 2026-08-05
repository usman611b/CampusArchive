import { Response } from 'express';
import { HttpStatusCodes, HttpStatusCode } from '../constants/httpStatuses';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Operation completed successfully.',
    statusCode: HttpStatusCode = HttpStatusCodes.OK,
    meta?: PaginationMeta
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta
    });
  }

  static error(
    res: Response,
    message = 'An unexpected error occurred.',
    statusCode: HttpStatusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR,
    errors?: Array<{ field?: string; message: string }>
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode
    });
  }
}
