import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate, createSaleSchema } from '../middleware/validation';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * GET /api/sales
 * Get all sales
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { stationId, limit = '10', offset = '0' } = req.query;

  try {
    const where: any = {};
    if (stationId) where.stationId = stationId as string;

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: true,
        station: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.sale.count({ where });

    return res.status(200).json({
      success: true,
      data: sales,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    logger.error('Get sales error', { error });
    return res.status(500).json({
      error: 'Failed to fetch sales',
    });
  }
}));

/**
 * POST /api/sales
 * Create a new sale (with validation)
 */
router.post('/', validate(createSaleSchema), asyncHandler(async (req: Request, res: Response) => {
  const { stationId, items, paymentMethod, totalAmount, notes } = req.body;
  const userId = (req as any).userId; // Get current user from auth token

  try {
    // Create sale with validated data
    const sale = await prisma.sale.create({
      data: {
        stationId,
        employeeId: userId,
        saleDate: new Date(),
        totalAmount,
        paymentMethod,
        notes: notes || '',
        items: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: true,
        station: true,
      },
    });

    logger.info('Sale created', { saleId: sale.id, stationId, total: totalAmount });

    return res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale,
    });
  } catch (error) {
    logger.error('Create sale error', { error });
    return res.status(500).json({
      error: 'Failed to create sale',
    });
  }
}));

/**
 * GET /api/sales/:id
 * Get a specific sale
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        station: true,
      },
    });

    if (!sale) {
      return res.status(404).json({
        error: 'Sale not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    logger.error('Get sale error', { error });
    return res.status(500).json({
      error: 'Failed to fetch sale',
    });
  }
}));

export default router;
