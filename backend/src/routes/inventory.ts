import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * GET /api/inventory
 * Get all inventory items
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { stationId, type, limit = '10', offset = '0' } = req.query;

  try {
    const where: any = {};
    if (stationId) where.stationId = stationId as string;
    if (type) where.type = type as string;

    const items = await prisma.inventoryItem.findMany({
      where,
      include: { station: true },
      orderBy: { name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.inventoryItem.count({ where });

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    logger.error('Get inventory error', { error });
    return res.status(500).json({
      error: 'Failed to fetch inventory',
    });
  }
}));

/**
 * POST /api/inventory
 * Create a new inventory item
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { stationId, name, sku, type, quantity, unitPrice, reorderLevel } = req.body;

  if (!stationId || !name || !type) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'stationId, name, and type are required',
    });
  }

  try {
    const item = await prisma.inventoryItem.create({
      data: {
        stationId,
        name,
        sku,
        type,
        quantity: quantity || 0,
        unitPrice: unitPrice || 0,
        reorderLevel: reorderLevel || 10,
      },
      include: { station: true },
    });

    logger.info('Inventory item created', { itemId: item.id, stationId });

    return res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: item,
    });
  } catch (error) {
    logger.error('Create inventory item error', { error });
    return res.status(500).json({
      error: 'Failed to create inventory item',
    });
  }
}));

/**
 * PUT /api/inventory/:id
 * Update inventory item
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, unitPrice, reorderLevel } = req.body;

  try {
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(unitPrice !== undefined && { unitPrice }),
        ...(reorderLevel !== undefined && { reorderLevel }),
      },
      include: { station: true },
    });

    logger.info('Inventory item updated', { itemId: item.id });

    return res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item,
    });
  } catch (error) {
    logger.error('Update inventory item error', { error });
    return res.status(500).json({
      error: 'Failed to update inventory item',
    });
  }
}));

export default router;
