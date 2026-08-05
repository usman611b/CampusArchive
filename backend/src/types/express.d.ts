import { UserRole } from '@campusarchive/shared';

export interface JwtUserPayload {
  id: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMINISTRATOR' | 'SUPER_ADMIN' | UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
