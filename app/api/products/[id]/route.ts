import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PricingResult {
  costPerGram: number;
  retailPerGram: number;
  totalRetailPrice: number;
  markup: number;
}

function calculateRetailPrice(
  costPerGram: number,
  markupPercentage: number,
  weightGrams: number
): PricingResult {
  const retailPerGram = costPerGram * (1 + markupPercentage / 100);
  const totalRetailPrice = parseFloat((retailPerGram * weightGrams).toFixed(2));

  return {
    costPerGram: parseFloat(costPerGram.toFixed(4)),
    retailPerGram: parseFloat(retailPerGram.toFixed(4)),
    totalRetailPrice,
    markup: markupPercentage,
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: body,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id: parseInt(params.id) },
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
