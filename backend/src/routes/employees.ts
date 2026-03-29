import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as authService from '../services/authService';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';
import { validate, createEmployeeSchema, updateEmployeeSchema } from '../middleware/validation';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Middleware for async error handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/employees
 * Get all employees
 */
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { stationId, role, isActive } = req.query;

  const where: any = {};
  if (stationId) where.stationId = stationId as string;
  if (role) where.role = role as string;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const employees = await prisma.user.findMany({
    where: {
      ...where,
      role: { not: 'ADMIN' }, // Don't list admins unless you want to
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      stationId: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  logger.info('Employees retrieved', { count: employees.length });
  res.json({
    success: true,
    data: employees,
    count: employees.length,
  });
}));

/**
 * POST /api/employees
 * Create new employee (manager/admin only)
 */
router.post('/', authenticateToken, requireManagerOrAdmin, validate(createEmployeeSchema), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, role, stationId } = req.body;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    res.status(400).json({
      error: 'Email already exists',
      message: 'An account with this email already exists',
    });
    return;
  }

  const passwordHash = await authService.hashPassword(password);

  const employee = await prisma.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      email,
      passwordHash,
      role: role || 'EMPLOYEE',
      stationId: stationId || null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      stationId: true,
      isActive: true,
      createdAt: true,
    },
  });

  logger.info('Employee created', { employeeId: employee.id, email });
  res.status(201).json({
    success: true,
    message: 'Employee created',
    data: employee,
  });
}));

/**
 * GET /api/employees/:employeeId
 * Get employee details
 */
router.get('/:employeeId', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { employeeId } = req.params;

  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      stationId: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!employee) {
    res.status(404).json({
      error: 'Employee not found',
      message: 'The requested employee does not exist',
    });
    return;
  }

  res.json({
    success: true,
    data: employee,
  });
}));

/**
 * PUT /api/employees/:employeeId
 * Update employee profile (manager/admin only)
 */
router.put('/:employeeId', authenticateToken, requireManagerOrAdmin, validate(updateEmployeeSchema), asyncHandler(async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const { firstName, lastName, phone, role, stationId } = req.body;

  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    res.status(404).json({
      error: 'Employee not found',
      message: 'The requested employee does not exist',
    });
    return;
  }

  const name = `${firstName || ''} ${lastName || ''}`.trim();

  const updatedEmployee = await prisma.user.update({
    where: { id: employeeId },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(role && { role }),
      ...(stationId !== undefined && { stationId }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      stationId: true,
      isActive: true,
      updatedAt: true,
    },
  });

  logger.info('Employee updated', { employeeId });
  res.json({
    success: true,
    message: 'Employee updated',
    data: updatedEmployee,
  });
}));

/**
 * DELETE /api/employees/:employeeId
 * Deactivate employee (manager/admin only)
 */
router.delete('/:employeeId', authenticateToken, requireManagerOrAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { employeeId } = req.params;

  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    res.status(404).json({
      error: 'Employee not found',
      message: 'The requested employee does not exist',
    });
    return;
  }

  // Deactivate instead of delete
  await prisma.user.update({
    where: { id: employeeId },
    data: { isActive: false },
  });

  logger.info('Employee deactivated', { employeeId });
  res.json({
    success: true,
    message: 'Employee deactivated',
  });
}));

export default router;
