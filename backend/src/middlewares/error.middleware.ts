import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/customErrors';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const migrationMissing = err?.code === 'PGRST205' && /public\.(resource_ratings|resource_comments|comment_likes)/.test(String(err?.message || ''))
    || String(err?.message || '').includes('comments_locked');
  if (!migrationMissing) console.error('[API ERROR]', err);

  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      success: false,
      message: `Validation Error: ${errorDetails}`,
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      data: null
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, errors: err.errors, data: null });
  }

  if (err?.code === '23505') {
    return res.status(409).json({ success: false, message: 'This interaction already exists.', data: null });
  }

  if (migrationMissing) {
    return res.status(503).json({
      success: false,
      message: 'Resource interaction database migration has not been applied.',
      data: null
    });
  }

  const errorMessage = err.message || 'Internal Server Error';

  if (errorMessage.startsWith('EMAIL_EXISTS') || errorMessage.startsWith('USERNAME_EXISTS')) {
    return res.status(409).json({
      success: false,
      message: errorMessage.split(': ')[1] || errorMessage,
      data: null
    });
  }

  if (errorMessage.startsWith('INVALID_CREDENTIALS') || errorMessage.startsWith('USER_NOT_FOUND')) {
    return res.status(401).json({
      success: false,
      message: errorMessage.split(': ')[1] || errorMessage,
      data: null
    });
  }

  return res.status(500).json({
    success: false,
    message: errorMessage,
    data: null
  });
};
