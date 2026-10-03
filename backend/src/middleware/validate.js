import { z } from 'zod';
import mongoose from 'mongoose';

export const productSchema = z
  .object({
    productName: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(1, 'Product name is required')
      .max(120, 'Product name must not exceed 120 characters'),
    sku: z
      .string({ required_error: 'SKU is required' })
      .trim()
      .min(1, 'SKU is required')
      .max(50, 'SKU must not exceed 50 characters')
      .regex(/^[A-Za-z0-9-_]+$/, 'SKU may only contain alphanumeric characters, hyphens, and underscores'),
    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(1, 'Category is required'),
    price: z.coerce
      .number({ required_error: 'Price is required' })
      .min(0, 'Price cannot be negative'),
    cost: z.coerce
      .number({ required_error: 'Cost is required' })
      .min(0, 'Cost cannot be negative'),
    stockQuantity: z.coerce
      .number({ required_error: 'Stock quantity is required' })
      .int('Stock quantity must be an integer')
      .min(0, 'Stock quantity cannot be negative'),
    reorderLevel: z.coerce
      .number({ required_error: 'Reorder level is required' })
      .int('Reorder level must be an integer')
      .min(0, 'Reorder level cannot be negative'),
  })
  .refine((data) => data.price >= data.cost, {
    message: 'Price cannot be lower than cost',
    path: ['price'],
  });

export const validateProduct = (req, res, next) => {
  const result = productSchema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const formattedErrors = issues.map((err) => ({
      field: err.path.join('.') || 'body',
      message: err.message,
    }));

    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  req.validatedBody = result.data;
  next();
};

export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid product ID format',
      errors: [{ field: 'id', message: 'Provided ID is not a valid MongoDB ObjectId' }],
    });
  }
  next();
};
