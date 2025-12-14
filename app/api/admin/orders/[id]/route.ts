import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { updateOrderStatusSchema } from '@/lib/validation/order';

/**
 * GET /api/admin/orders/[id]
 * Fetch a single order with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          error: 'Invalid order ID',
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                baseName: true,
                variety: true,
                sku: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order status (and optionally restore inventory on cancellation)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          error: 'Invalid order ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateOrderStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // Use a transaction to update status and potentially restore inventory
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Fetch the current order
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!currentOrder) {
        throw new Error('Order not found');
      }

      // If changing to CANCELLED, restore inventory
      if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        for (const item of currentOrder.items) {
          await tx.inventoryStock.update({
            where: { productId: item.productId },
            data: {
              quantityAvailable: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Update the order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: true,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to update order',
      },
      { status: 500 }
    );
  }
}
