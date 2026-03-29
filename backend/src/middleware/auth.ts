import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import logger from '../utils/logger';

/**
 * Auth Middleware
 * Verifies JWT token and attaches user to request
 * Usage: router.get('/protected', authenticateToken, controller)
 */
export const authenticateToken = (
  req: Request & { userId?: string; userRole?: string },
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Missing auth token', { ip: req.ip, path: req.path });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'No authorization token provided',
    });
    return;
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    logger.warn('Invalid token', { ip: req.ip, path: req.path });
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token',
    });
    return;
  }

  req.userId = decoded.id;
  req.userRole = decoded.role;
  next();
};

/**
 * Admin-only Middleware
 * Ensures only ADMIN role can access the endpoint
 */
export const requireAdmin = (
  req: Request & { userRole?: string },
  res: Response,
  next: NextFunction
): void => {
  if (req.userRole !== 'ADMIN') {
    logger.warn('Unauthorized access attempt', {
      userId: (req as any).userId,
      requiredRole: 'ADMIN',
      userRole: req.userRole,
    });
    res.status(403).json({
      error: 'Forbidden',
      message: 'This action requires admin privileges',
    });
    return;
  }
  next();
};

/**
 * Manager-or-Admin Middleware
 * Ensures only MANAGER or ADMIN roles can access
 */
export const requireManagerOrAdmin = (
  req: Request & { userRole?: string },
  res: Response,
  next: NextFunction
): void => {
  if (!['ADMIN', 'MANAGER'].includes(req.userRole || '')) {
    logger.warn('Unauthorized access attempt', {
      userId: (req as any).userId,
      requiredRole: 'ADMIN or MANAGER',
      userRole: req.userRole,
    });
    res.status(403).json({
      error: 'Forbidden',
      message: 'This action requires manager or admin privileges',
    });
    return;
  }
  next();
};
