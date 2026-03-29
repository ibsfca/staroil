import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/stations
 * Get all stations with their details, manager info, and fuel inventory
 * Admin/Manager can see all stations, Employee sees only their assigned station
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, userRole } = (req as any);
    let userStation = null;

    // Get current user to check their station assignment
    if (userRole === 'EMPLOYEE') {
      userStation = await prisma.user.findUnique({
        where: { id: userId },
        select: { stationId: true },
      });
    }

    // Build query based on user role
    let stationQuery: any = {
      where: userRole === 'EMPLOYEE' ? { id: userStation?.stationId } : {},
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
        inventoryItems: {
          select: {
            id: true,
            name: true,
            type: true,
            quantity: true,
            unitPrice: true,
            reorderLevel: true,
          },
        },
        sales: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    };

    const stations = await prisma.station.findMany(stationQuery);

    // Calculate statistics for each station
    const stationsWithStats = stations.map((station: any) => {
      const fuelInventory = station.inventoryItems.filter(
        (item: any) => item.type === 'FUEL'
      );
      const convenienceInventory = station.inventoryItems.filter(
        (item: any) => item.type === 'CONVENIENCE'
      );

      const lowStockItems = station.inventoryItems.filter(
        (item: any) => item.quantity <= (item.reorderLevel || 10)
      );

      const totalInventoryValue = station.inventoryItems.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
        0
      );

      const recentSalesTotal = station.sales.reduce(
        (sum: number, sale: any) => sum + sale.totalAmount,
        0
      );

      return {
        ...station,
        stats: {
          totalEmployees: station.users.length,
          activeEmployees: station.users.filter((u: any) => u.isActive).length,
          fuelTypesCount: fuelInventory.length,
          convenienceItemsCount: convenienceInventory.length,
          totalInventoryValue,
          lowStockItemsCount: lowStockItems.length,
          recentSalesCount: station.sales.length,
          recentSalesTotal,
        },
      };
    });

    logger.info('Stations retrieved successfully', {
      userId,
      userRole,
      count: stationsWithStats.length,
    });

    res.json({
      message: 'Stations retrieved successfully',
      data: stationsWithStats,
      total: stationsWithStats.length,
    });
    return;
  } catch (error: any) {
    logger.error('Error fetching stations', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Failed to fetch stations',
      message: error.message,
    });
    return;
  }
});

/**
 * GET /api/stations/:stationId
 * Get specific station with full details
 */
router.get('/:stationId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;
    const { userId, userRole } = (req as any);

    // Check user permission (EMPLOYEE can only view their own station)
    if (userRole === 'EMPLOYEE') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stationId: true },
      });

      if (user?.stationId !== stationId) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'You can only view your assigned station',
        });
      }
    }

    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
          orderBy: { name: 'asc' },
        },
        inventoryItems: {
          select: {
            id: true,
            name: true,
            type: true,
            sku: true,
            quantity: true,
            unitPrice: true,
            reorderLevel: true,
            lastCountDate: true,
          },
          orderBy: { name: 'asc' },
        },
        sales: {
          select: {
            id: true,
            totalAmount: true,
            paymentMethod: true,
            createdAt: true,
            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        shifts: {
          select: {
            id: true,
            shiftDate: true,
            clockInTime: true,
            clockOutTime: true,
            status: true,
            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 30,
          orderBy: { shiftDate: 'desc' },
        },
      },
    });

    if (!station) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Station not found',
      });
    }

    logger.info('Station details retrieved', {
      stationId,
      userId,
    });

    res.json({
      message: 'Station details retrieved successfully',
      data: station,
    });
    return;
  } catch (error: any) {
    logger.error('Error fetching station details', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Failed to fetch station details',
      message: error.message,
    });
    return;
  }
});

/**
 * GET /api/stations/:stationId/fuel-inventory
 * Get only fuel inventory for a station
 */
router.get('/:stationId/fuel-inventory', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;

    const fuelItems = await prisma.inventoryItem.findMany({
      where: {
        stationId,
        type: 'FUEL',
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        unitPrice: true,
        reorderLevel: true,
        lastCountDate: true,
      },
      orderBy: { name: 'asc' },
    });

    logger.info('Fuel inventory retrieved', {
      stationId,
      count: fuelItems.length,
    });

    res.json({
      message: 'Fuel inventory retrieved successfully',
      data: fuelItems,
      total: fuelItems.length,
    });
    return;
  } catch (error: any) {
    logger.error('Error fetching fuel inventory', {
      error: error.message,
    });
    res.status(500).json({
      error: 'Failed to fetch fuel inventory',
      message: error.message,
    });
    return;
  }
});

/**
 * GET /api/stations/:stationId/summary
 * Get station summary statistics
 */
router.get('/:stationId/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;

    // Get station basic info
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: { id: true, name: true, address: true, phone: true },
    });

    if (!station) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Station not found',
      });
    }

    // Get employee count
    const employeeCount = await prisma.user.count({
      where: { stationId, role: 'EMPLOYEE', isActive: true },
    });

    // Get recent sales
    const salesData = await prisma.sale.findMany({
      where: { stationId },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const todaySales = salesData
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        const today = new Date();
        return saleDate.toDateString() === today.toDateString();
      })
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Get inventory info
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { stationId },
      select: { quantity: true, unitPrice: true, reorderLevel: true },
    });

    const totalInventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity <= (item.reorderLevel || 10)
    );

    logger.info('Station summary retrieved', { stationId });

    res.json({
      message: 'Station summary retrieved successfully',
      data: {
        station,
        stats: {
          activeEmployees: employeeCount,
          totalSales,
          todaySales,
          totalInventoryValue,
          lowStockItemsCount: lowStockItems.length,
          totalInventoryItems: inventoryItems.length,
        },
      },
    });
    return;
  } catch (error: any) {
    logger.error('Error fetching station summary', {
      error: error.message,
    });
    res.status(500).json({
      error: 'Failed to fetch station summary',
      message: error.message,
    });
    return;
  }
});

export default router;
