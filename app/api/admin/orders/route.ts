import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

/**
 * GET /api/admin/orders
 * Fetch all orders with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Filter parameters
    const statusFilter = searchParams.get('status') as OrderStatus | null;
    const searchQuery = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};

    if (statusFilter && Object.values(OrderStatus).includes(statusFilter)) {
      where.status = statusFilter;
    }

    if (searchQuery) {
      where.OR = [
        { orderNumber: { contains: searchQuery } },
        { customerName: { contains: searchQuery } },
        { customerEmail: { contains: searchQuery } },
      ];
    }

    // Fetch orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          status: true,
          itemCount: true,
          subtotal: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}
