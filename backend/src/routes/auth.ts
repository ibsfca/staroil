import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as authService from '../services/authService';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Middleware to handle async errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Email and password are required',
    });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { station: true },
    });

    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Check password
    const isPasswordValid = await authService.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn('Login attempt with wrong password', { email });
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = authService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          stationId: user.stationId,
          station: user.station,
        },
      },
    });
  } catch (error: any) {
    logger.error('Login error', { error: error?.message || error, email, stack: error?.stack });
    console.error('Login error details:', error);
    return res.status(500).json({
      error: 'Login failed',
      message: error?.message || 'An error occurred during login',
    });
  }
}));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Missing refresh token',
      message: 'Refresh token is required',
    });
  }

  try {
    // Verify refresh token
    const decoded = authService.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh-secret');
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Refresh token is invalid or expired',
      });
    }

    // Check if token matches in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Refresh token does not match',
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    logger.info('Token refreshed', { userId: user.id });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error('Token refresh error', { error });
    return res.status(401).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing token',
    });
  }
}));

/**
 * POST /api/auth/logout
 * Logout user (clear refresh token)
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      error: 'Missing user ID',
      message: 'User ID is required',
    });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    logger.info('User logged out', { userId });

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error', { error, userId });
    return res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout',
    });
  }
}));

/**
 * GET /api/auth/me
 * Get current user info (requires auth token)
 */
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing authorization',
      message: 'Authorization header is required',
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = authService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { station: true },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        stationId: user.stationId,
        station: user.station,
      },
    });
  } catch (error) {
    logger.error('Get user info error', { error });
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'An error occurred while verifying token',
    });
  }
}));

export default router;
