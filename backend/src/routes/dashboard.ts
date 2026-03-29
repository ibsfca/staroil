import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Middleware for async error handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/dashboard/metrics
 * Get dashboard KPIs and summary metrics
 */
router.get('/metrics', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { stationId, startDate, endDate } = req.query;

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate as string);
  if (endDate) dateFilter.lte = new Date(endDate as string);

  const where: any = {};
  if (stationId) where.stationId = stationId as string;
  if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;

  // Total Sales
  const sales = await prisma.sale.findMany({ where });
  const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  // Total Refunds
  const refunds = await prisma.refund.findMany({ where });
  const totalRefunds = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Average Transaction Value
  const avgTransaction = sales.length > 0 ? totalSales / sales.length : 0;

  // Low Stock Items
  const allInventoryItems = await prisma.inventoryItem.findMany({
    where: stationId ? { stationId: stationId as string } : {},
  });
  const lowStockItems = allInventoryItems.filter(
    (item) => item.quantity <= (item.reorderLevel || 10)
  );

  // Sales by Payment Method
  const salesByPaymentMethod = sales.reduce((acc: any, sale) => {
    const method = sale.paymentMethod || 'OTHER';
    const existing = acc.find((item: any) => item.method === method);
    if (existing) {
      existing.total += sale.totalAmount;
      existing.count += 1;
    } else {
      acc.push({ method, total: sale.totalAmount, count: 1 });
    }
    return acc;
  }, []);

  // Top Sales
  const topSales = sales
    .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      amount: s.totalAmount,
      paymentMethod: s.paymentMethod,
      date: s.createdAt,
    }));

  // Active Shifts Today
  const today = new Date().toDateString();
  const todayStart = new Date(today);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const activeShifts = await prisma.employeeShift.findMany({
    where: {
      ...(stationId && { stationId: stationId as string }),
      clockOutTime: null,
      shiftDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      employee: { select: { name: true } },
    },
  });

  const metrics = {
    totalSales,
    totalRefunds,
    averageTransactionValue: avgTransaction,
    salesCount: sales.length,
    refundCount: refunds.length,
    lowStockItems: lowStockItems.length,
    activeShiftsCount: activeShifts.length,
    activeShifts: activeShifts.map((s) => ({
      employeeName: s.employee?.name,
      clockInTime: s.clockInTime,
    })),
    salesByPaymentMethod,
    topSales,
    dateRange: {
      from: startDate || 'all-time',
      to: endDate || 'today',
    },
  };

  logger.info('Dashboard metrics retrieved', {
    stationId: stationId || 'all',
    totalSales,
    salesCount: sales.length,
  });

  res.json({
    success: true,
    data: metrics,
  });
}));

/**
 * GET /api/dashboard/inventory-summary
 * Get inventory status summary
 */
router.get('/inventory-summary', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { stationId } = req.query;

  const where: any = {};
  if (stationId) where.stationId = stationId as string;

  const items = await prisma.inventoryItem.findMany({ where });

  const summary = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    lowStockCount: items.filter((item) => item.quantity <= (item.reorderLevel || 0)).length,
    itemsByType: items.reduce((acc: any, item) => {
      const type = item.type || 'OTHER';
      const existing = acc.find((i: any) => i.type === type);
      if (existing) {
        existing.count += 1;
        existing.value += item.quantity * item.unitPrice;
      } else {
        acc.push({ type, count: 1, value: item.quantity * item.unitPrice });
      }
      return acc;
    }, []),
  };

  res.json({
    success: true,
    data: summary,
  });
}));

/**
 * GET /api/dashboard/employee-summary
 * Get employee hours and productivity summary
 */
router.get('/employee-summary', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { stationId, startDate, endDate } = req.query;

  const where: any = {};
  if (stationId) where.stationId = stationId as string;

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate as string);
  if (endDate) dateFilter.lte = new Date(endDate as string);
  if (Object.keys(dateFilter).length > 0) where.shiftDate = dateFilter;

  const shifts = await prisma.employeeShift.findMany({
    where,
    include: {
      employee: { select: { id: true, name: true } },
    },
  });

  const employeeSummary = shifts.reduce((acc: any, shift) => {
    const empId = shift.employeeId;
    const existing = acc.find((e: any) => e.employeeId === empId);

    // Calculate hours worked from clockInTime and clockOutTime
    let hoursWorked = 0;
    if (shift.clockOutTime) {
      const diffMs = shift.clockOutTime.getTime() - shift.clockInTime.getTime();
      hoursWorked = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
    }

    if (existing) {
      existing.shiftsCount += 1;
      existing.totalHours += hoursWorked;
    } else {
      acc.push({
        employeeId: empId,
        employeeName: shift.employee?.name,
        shiftsCount: 1,
        totalHours: hoursWorked,
      });
    }
    return acc;
  }, []);

  // Calculate total hours from all shifts
  const totalHours = shifts.reduce((sum, shift) => {
    if (!shift.clockOutTime) return sum;
    const diffMs = shift.clockOutTime.getTime() - shift.clockInTime.getTime();
    return sum + diffMs / (1000 * 60 * 60);
  }, 0);

  res.json({
    success: true,
    data: {
      summary: employeeSummary,
      totalShifts: shifts.length,
      totalHours,
    },
  });
}));

export default router;
