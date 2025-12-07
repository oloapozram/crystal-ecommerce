import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/validation/order';
import { generateOrderNumber } from '@/lib/utils/order-number';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * POST /api/orders
 * Create a new order from checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { customerName, customerEmail, customerPhone, customerMessage, items } =
      validationResult.data;

    // Use a transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // 1. Fetch all products and validate availability
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
        include: {
          stock: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error('One or more products not found or inactive');
      }

      // 2. Check inventory availability and calculate totals
      let subtotal = new Decimal(0);
      const orderItems: Array<{
        productId: number;
        sku: string;
        productName: string;
        pricePerUnit: Decimal;
        quantity: number;
      }> = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        // Check stock availability
        if (!product.stock || product.stock.quantityAvailable < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.baseName}. Available: ${product.stock?.quantityAvailable || 0}, Requested: ${item.quantity}`
          );
        }

        // Calculate price (using a simple pricing strategy based on cost)
        // In a real application, you would have a pricing table or calculation
        const costPerGram = product.stock.avgCostPerGram || new Decimal(0);
        const weightPerUnit = product.sizeMm; // Simplified - using sizeMm as proxy for weight
        const pricePerUnit = costPerGram
          .mul(weightPerUnit)
          .mul(new Decimal(1.4)); // 40% markup

        const itemTotal = pricePerUnit.mul(item.quantity);
        subtotal = subtotal.add(itemTotal);

        orderItems.push({
          productId: product.id,
          sku: product.sku,
          productName: `${product.baseName}${product.variety ? ' - ' + product.variety : ''} (${product.sizeMm}mm)`,
          pricePerUnit,
          quantity: item.quantity,
        });
      }

      // 3. Generate unique order number
      let orderNumber = generateOrderNumber();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await tx.order.findUnique({
          where: { orderNumber },
        });
        if (!existing) break;
        orderNumber = generateOrderNumber();
        attempts++;
      }
      if (attempts >= 10) {
        throw new Error('Failed to generate unique order number');
      }

      // 4. Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          customerMessage: customerMessage || null,
          status: 'PENDING_PAYMENT',
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // 5. Deduct inventory for each item
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product?.stock) continue;

        await tx.inventoryStock.update({
          where: { productId: item.productId },
          data: {
            quantityAvailable: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Order creation failed',
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
