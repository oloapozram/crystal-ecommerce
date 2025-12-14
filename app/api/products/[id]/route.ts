import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { calculateRetailPrice } from '@/lib/pricing';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        stock: true,
        mediaFiles: {
          orderBy: { displayOrder: 'asc' },
        },
        purchases: {
          include: { supplier: true },
          orderBy: { purchaseDate: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const avgCost = product.stock?.avgCostPerGram?.toNumber() || 0;
    const weightGrams = product.stock?.weightGramsAvailable?.toNumber() || 0;
    const pricing = calculateRetailPrice(avgCost, 40, weightGrams);

    return NextResponse.json({
      ...product,
      pricing,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();

    // Validate input - allow partial updates
    const updateSchema = z.object({
      baseName: z.string().min(2).optional(),
      sizeMm: z.coerce.number().min(0).optional(),
      qualityGrade: z.enum(["NORMAL", "GOOD", "HIGH"]).optional(),
      sku: z.string().min(3).optional(),
      baziElement: z.enum(["WOOD", "FIRE", "EARTH", "METAL", "WATER"]).optional(),
      description: z.string().optional(),
      metaphysicalProperties: z.string().optional(),
      isActive: z.boolean().optional(),
    });

    const validatedData = updateSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
