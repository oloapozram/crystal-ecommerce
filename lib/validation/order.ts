import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

/**
 * Validation schema for order item input
 */
export const orderItemSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

/**
 * Validation schema for creating an order
 */
export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(255, 'Customer name must not exceed 255 characters'),
  customerEmail: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  customerPhone: z
    .string()
    .max(50, 'Phone number must not exceed 50 characters')
    .optional(),
  customerMessage: z.string().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item')
    .max(100, 'Order cannot contain more than 100 items'),
});

/**
 * Validation schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

/**
 * Type exports
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
