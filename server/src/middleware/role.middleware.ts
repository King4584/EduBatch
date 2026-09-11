import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { ApiError } from '../utils/apiError.js';
import { UserRole } from '../models/User.js';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
