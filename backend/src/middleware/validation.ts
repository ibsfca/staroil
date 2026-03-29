import Joi from 'joi';

/**
 * Input Validation Schemas
 * Validates all incoming request data
 */

// Auth Validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Sales Validation
export const createSaleSchema = Joi.object({
  stationId: Joi.string().required(),
  employeeId: Joi.string().required(),
  totalAmount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'CHECK').required(),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().positive().required(),
        subtotal: Joi.number().positive().required(),
      })
    )
    .required(),
});

export const updateSaleSchema = Joi.object({
  totalAmount: Joi.number().positive(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'CHECK'),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required(),
      subtotal: Joi.number().positive().required(),
    })
  ),
}).min(1);

// Inventory Validation
export const createInventoryItemSchema = Joi.object({
  stationId: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  itemType: Joi.string().valid('FUEL', 'SNACK', 'BEVERAGE', 'SUPPLY', 'OTHER').required(),
  quantity: Joi.number().min(0).required(),
  reorderLevel: Joi.number().min(0),
  unitPrice: Joi.number().positive().required(),
  lastRestocked: Joi.date(),
});

export const updateInventoryItemSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  itemType: Joi.string().valid('FUEL', 'SNACK', 'BEVERAGE', 'SUPPLY', 'OTHER'),
  quantity: Joi.number().min(0),
  reorderLevel: Joi.number().min(0),
  unitPrice: Joi.number().positive(),
  lastRestocked: Joi.date(),
}).min(1);

// Employee Shift Validation
export const createShiftSchema = Joi.object({
  employeeId: Joi.string().required(),
  stationId: Joi.string().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().min(Joi.ref('startTime')),
  hoursWorked: Joi.number().positive(),
  notes: Joi.string().max(500),
});

export const updateShiftSchema = Joi.object({
  endTime: Joi.date().required(),
  hoursWorked: Joi.number().positive(),
  notes: Joi.string().max(500),
}).min(1);

// Employee Validation
export const createEmployeeSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().pattern(/^\d{10,}$/),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').default('EMPLOYEE'),
  stationId: Joi.string(),
  hireDate: Joi.date().max(new Date()),
});

export const updateEmployeeSchema = Joi.object({
  firstName: Joi.string().min(1).max(50),
  lastName: Joi.string().min(1).max(50),
  phone: Joi.string().pattern(/^\d{10,}$/),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE'),
  stationId: Joi.string(),
}).min(1);

// Refund Validation
export const createRefundSchema = Joi.object({
  saleId: Joi.string().required(),
  reason: Joi.string().max(500),
  amount: Joi.number().positive().required(),
  processedBy: Joi.string().required(),
});

/**
 * Validation middleware factory
 * Usage: router.post('/sales', validate(createSaleSchema), controller)
 */
export const validate = (schema: Joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      });
    }

    req.body = value;
    next();
  };
};
