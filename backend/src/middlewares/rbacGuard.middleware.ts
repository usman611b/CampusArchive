import { Request, Response, NextFunction } from 'express';
import { UserRole, RoleHierarchy } from '../constants/roles';
import { ForbiddenError, UnauthorizedError } from '../utils/customErrors';

export const rbacGuard = (minimumRequiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required prior to permission verification.'));
    }

    const userRoleScore = RoleHierarchy[req.user.role as UserRole] ?? 0;
    const requiredRoleScore = RoleHierarchy[minimumRequiredRole] ?? 999;

    if (userRoleScore < requiredRoleScore) {
      return next(new ForbiddenError(`Insufficient role privileges. Minimum required role: ${minimumRequiredRole}`));
    }

    next();
  };
};
