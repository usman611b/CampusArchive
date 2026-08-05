import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: any };
    let currentRole = decoded.role;

    // Fetch dynamic role from database to ensure newly promoted roles take effect immediately
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('role, deleted_at')
        .eq('id', decoded.sub)
        .single();

      if (dbUser?.deleted_at) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Your account has been suspended by an administrator.'
          }
        });
      }

      if (dbUser) {
        currentRole = dbUser.role || decoded.role;
      }
    } catch {}

    req.user = {
      id: decoded.sub,
      role: currentRole as UserRole
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
export const optionalAuthenticateJwt = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), env.JWT_SECRET) as { sub: string; role: UserRole };
      req.user = { id: decoded.sub, role: decoded.role };
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
