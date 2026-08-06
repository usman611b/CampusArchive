import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../config/env';
import { supabase } from '../config/database';
import { UserRole, Permission, RolePermissions } from '@campusarchive/shared';

export const authenticateJwt = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Missing Bearer token.',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: any; pwd?: string };
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role, deleted_at, is_suspended, password_hash')
      .eq('id', decoded.sub)
      .maybeSingle();

    // Authorization must fail closed. Never trust a role cached in a JWT when
    // the authoritative user record cannot be checked.
    if (dbError) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
        data: null
      });
    }

    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.', data: null });
    }

    if (dbUser.deleted_at || dbUser.is_suspended) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended or deleted.'
        }
      });
    }

    const passwordVersion = createHash('sha256').update(dbUser.password_hash).digest('hex').slice(0, 16);
    if (!decoded.pwd || decoded.pwd !== passwordVersion) {
      return res.status(401).json({ success: false, message: 'Session is no longer valid. Please sign in again.', data: null });
    }

    req.user = {
      id: decoded.sub,
      role: dbUser.role as UserRole
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      data: null
    });
  }
};

/** Adds request identity when a valid token is present while keeping public reads public. */
export const optionalAuthenticateJwt = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), env.JWT_SECRET) as { sub: string; role: UserRole; pwd?: string };
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('role, deleted_at, is_suspended, password_hash')
        .eq('id', decoded.sub)
        .maybeSingle();
      const passwordVersion = dbUser
        ? createHash('sha256').update(dbUser.password_hash).digest('hex').slice(0, 16)
        : null;
      if (!error && dbUser && !dbUser.deleted_at && !dbUser.is_suspended && decoded.pwd === passwordVersion) {
        req.user = { id: decoded.sub, role: dbUser.role as UserRole };
      }
    } catch { /* Invalid optional credentials are treated as anonymous. */ }
  }
  next();
};

/**
 * Role-Based Access Control Middleware (RBAC)
 */
export const requireRole = (...roles: (keyof typeof UserRole | UserRole)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        data: null
      });
    }

    const userRoleStr = req.user.role as string;
    const allowedRolesStr = roles.map(r => r.toString());

    if (!allowedRolesStr.includes(userRoleStr)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized for this resource.`,
        data: null
      });
    }

    next();
  };
};

/**
 * Granular Permission-Based Access Control Middleware (PBAC)
 * Enforces permission checks derived from RolePermissions matrix
 */
export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        data: null
      });
    }

    const userRole = req.user.role as UserRole;
    const grantedPermissions = RolePermissions[userRole] || [];

    // Check if user has ALL required permissions or is SUPER_ADMIN / ADMINISTRATOR for admin tasks
    const hasPermission = userRole === 'SUPER_ADMIN' || requiredPermissions.every((perm) => grantedPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${userRole}' lacks required permissions: [${requiredPermissions.join(', ')}].`,
        data: null
      });
    }

    next();
  };
};
