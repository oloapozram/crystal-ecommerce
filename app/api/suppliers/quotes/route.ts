import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const productId = searchParams.get('productId');
  const supplierId = searchParams.get('supplierId');

  const quotes = await prisma.supplierQuote.findMany({
    where: {
      ...(status && { status: status.toUpperCase() as any }),
      ...(productId && { productId: parseInt(productId) }),
      ...(supplierId && { supplierId: parseInt(supplierId) }),
    },
    include: {
      supplier: {
        select: { id: true, name: true, contactEmail: true },
      },
      product: {
        select: { id: true, baseName: true, sizeMm: true, qualityGrade: true, sku: true },
      },
      convertedPurchase: {
        select: { id: true, purchaseDate: true, costTotal: true },
      },
    },
    orderBy: { quoteDate: 'desc' },
  });

  return NextResponse.json(quotes);
}

export async function POST(request: Request) {
  const body = await request.json();

  const quote = await prisma.supplierQuote.create({
    data: {
      supplierId: body.supplierId,
      productId: body.productId,
      quotedPricePerGram: body.quotedPricePerGram,
      minimumOrderGrams: body.minimumOrderGrams,
      estimatedQualityRating: body.estimatedQualityRating,
      quoteDate: body.quoteDate ? new Date(body.quoteDate) : new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      notes: body.notes,
    },
    include: {
      supplier: true,
      product: true,
    },
  });

  return NextResponse.json(quote, { status: 201 });
}
