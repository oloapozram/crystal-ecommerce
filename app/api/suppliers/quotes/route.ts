import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { supplierQuoteSchema } from '@/lib/validations/supplier-quote';

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
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = supplierQuoteSchema.parse(body);

    const quote = await prisma.supplierQuote.create({
      data: {
        supplierId: validatedData.supplierId,
        productId: validatedData.productId,
        quotedPricePerGram: validatedData.quotedPricePerGram,
        minimumOrderGrams: validatedData.minimumOrderGrams,
        estimatedQualityRating: validatedData.estimatedQualityRating,
        quoteDate: validatedData.quoteDate ? new Date(validatedData.quoteDate) : new Date(),
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        notes: validatedData.notes,
      },
      include: {
        supplier: true,
        product: true,
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier quote:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create supplier quote' },
      { status: 500 }
    );
  }
}
