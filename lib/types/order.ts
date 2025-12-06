import { OrderStatus } from '@prisma/client';

/**
 * Order creation input from checkout form
 */
export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerMessage?: string;
  items: OrderItemInput[];
}

/**
 * Order item input for order creation
 */
export interface OrderItemInput {
  productId: number;
  quantity: number;
}

/**
 * Complete order data with items
 */
export interface OrderWithItems {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerMessage: string | null;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemData[];
}

/**
 * Order item data
 */
export interface OrderItemData {
  id: number;
  orderId: number;
  productId: number;
  sku: string;
  productName: string;
  pricePerUnit: number;
  quantity: number;
}

/**
 * Order status update input
 */
export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

/**
 * Order list item (summary view)
 */
export interface OrderListItem {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  createdAt: Date;
}
