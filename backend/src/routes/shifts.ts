import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';
import { validate, createShiftSchema, updateShiftSchema } from '../middleware/validation';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Middleware for async error handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/shifts
 * Get all shifts (with optional filters)
 */
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { employeeId, stationId, status, startDate, endDate } = req.query;

  const where: any = {};
  if (employeeId) where.employeeId = employeeId as string;
  if (stationId) where.stationId = stationId as string;
  if (status) where.status = status as string;

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.shiftDate.gte = new Date(startDate as string);
    if (endDate) where.shiftDate.lte = new Date(endDate as string);
  }

  const shifts = await prisma.employeeShift.findMany({
    where,
    include: {
      employee: { select: { id: true, name: true, email: true } },
      station: { select: { id: true, name: true } },
    },
    orderBy: { shiftDate: 'desc' },
  });

  logger.info('Shifts retrieved', { count: shifts.length });
  res.json({
    success: true,
    data: shifts,
    count: shifts.length,
  });
  return;
}));

/**
 * POST /api/shifts
 * Create new shift (start shift)
 */
router.post('/', authenticateToken, validate(createShiftSchema), asyncHandler(async (req: Request, res: Response) => {
  const { employeeId, stationId, startTime, notes } = req.body;

  // Check if employee already has active shift
  const activeShift = await prisma.employeeShift.findFirst({
    where: {
      employeeId,
      status: 'ACTIVE',
    },
  });

  if (activeShift) {
    return res.status(400).json({
      error: 'Active shift exists',
      message: 'Employee already has an active shift',
    });
  }

  const shift = await prisma.employeeShift.create({
    data: {
      employeeId,
      stationId,
      shiftDate: new Date(startTime),
      clockInTime: new Date(startTime),
      status: 'ACTIVE',
      notes: notes || '',
    },
    include: {
      employee: true,
      station: true,
    },
  });

  logger.info('Shift started', { shiftId: shift.id, employeeId, stationId });
  res.status(201).json({
    success: true,
    message: 'Shift started',
    data: shift,
  });
  return;
}));

/**
 * GET /api/shifts/:shiftId
 * Get specific shift details
 */
router.get('/:shiftId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { shiftId } = req.params;

  const shift = await prisma.employeeShift.findUnique({
    where: { id: shiftId },
    include: {
      employee: true,
      station: true,
    },
  });

  if (!shift) {
    return res.status(404).json({
      error: 'Shift not found',
      message: 'The requested shift does not exist',
    });
  }

  res.json({
    success: true,
    data: shift,
  });
  return;
}));

/**
 * PUT /api/shifts/:shiftId
 * Update shift (end shift, update hours)
 */
router.put('/:shiftId', authenticateToken, validate(updateShiftSchema), asyncHandler(async (req: Request, res: Response) => {
  const { shiftId } = req.params;
  const { endTime, hoursWorked, notes } = req.body;

  const shift = await prisma.employeeShift.findUnique({
    where: { id: shiftId },
  });

  if (!shift) {
    return res.status(404).json({
      error: 'Shift not found',
      message: 'The requested shift does not exist',
    });
  }

  const endTimeDate = new Date(endTime);
  const calculatedHours = (endTimeDate.getTime() - shift.clockInTime.getTime()) / (1000 * 60 * 60);

  const updatedShift = await prisma.employeeShift.update({
    where: { id: shiftId },
    data: {
      endTime: endTimeDate,
      hoursWorked: hoursWorked || calculatedHours,
      status: 'COMPLETED',
      ...(notes && { notes }),
    },
    include: {
      employee: true,
      station: true,
    },
  });

  logger.info('Shift ended', {
    shiftId,
    employeeId: shift.employeeId,
    clockOutTime: updatedShift.clockOutTime,
  });

  res.json({
    success: true,
    message: 'Shift updated',
    data: updatedShift,
  });
  return;
}));

/**
 * DELETE /api/shifts/:shiftId
 * Delete/cancel shift (admin only)
 */
router.delete('/:shiftId', authenticateToken, requireManagerOrAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { shiftId } = req.params;

  const shift = await prisma.employeeShift.findUnique({
    where: { id: shiftId },
  });

  if (!shift) {
    return res.status(404).json({
      error: 'Shift not found',
      message: 'The requested shift does not exist',
    });
  }

  await prisma.employeeShift.delete({
    where: { id: shiftId },
  });

  logger.info('Shift deleted', { shiftId, employeeId: shift.employeeId });

  res.json({
    success: true,
    message: 'Shift deleted',
  });
  return;
}));

/**
 * GET /api/shifts/active/:employeeId
 * Get employee's active shift
 */
router.get('/active/:employeeId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  const activeShift = await prisma.employeeShift.findFirst({
    where: {
      employeeId,
      status: 'ACTIVE',
    },
    include: {
      employee: true,
      station: true,
    },
  });

  if (!activeShift) {
    return res.status(404).json({
      error: 'No active shift',
      message: 'Employee does not have an active shift',
    });
  }

  res.json({
    success: true,
    data: activeShift,
  });
  return;
}));

export default router;
