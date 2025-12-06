import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request: items must be an array' },
        { status: 400 }
      );
    }

    // Fetch all products with stock info
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        stock: true,
      },
    });

    const validationResults = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);

      if (!product) {
        return {
          productId: item.productId,
          valid: false,
          error: 'Product not found or inactive',
        };
      }

      const stockAvailable = product.stock?.quantityAvailable || 0;

      if (item.quantity > stockAvailable) {
        return {
          productId: item.productId,
          valid: false,
          error: `Only ${stockAvailable} units available`,
          stockAvailable,
        };
      }

      // Calculate current price
      const avgCostPerGram = product.stock?.avgCostPerGram?.toNumber() || 0;
      const markupPercentage = 40;
      const weightGrams = product.stock?.weightGramsAvailable?.toNumber() || 0;
      const pricePerGram = avgCostPerGram * (1 + markupPercentage / 100);
      const currentPrice = pricePerGram * weightGrams;

      const priceMismatch = Math.abs(currentPrice - item.pricePerUnit) > 0.01;

      return {
        productId: item.productId,
        valid: true,
        stockAvailable,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        priceMismatch,
      };
    });

    const allValid = validationResults.every((r: any) => r.valid);

    return NextResponse.json({
      valid: allValid,
      items: validationResults,
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate cart' },
      { status: 500 }
    );
  }
}
