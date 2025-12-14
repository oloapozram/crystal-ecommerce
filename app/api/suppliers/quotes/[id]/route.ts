import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { supplierQuoteUpdateSchema } from '@/lib/validations/supplier-quote';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await prisma.supplierQuote.findUnique({
    where: { id: parseInt(id) },
    include: {
      supplier: true,
      product: true,
      convertedPurchase: true,
    },
  });

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  return NextResponse.json(quote);
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

    // Validate input
    const validatedData = supplierQuoteUpdateSchema.parse(body);

    const quote = await prisma.supplierQuote.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        ...(validatedData.expiresAt && { expiresAt: new Date(validatedData.expiresAt) }),
        ...(validatedData.quoteDate && { quoteDate: new Date(validatedData.quoteDate) }),
      },
      include: {
        supplier: true,
        product: true,
      },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error updating supplier quote:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update supplier quote' },
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
    await prisma.supplierQuote.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier quote' },
      { status: 500 }
    );
  }
}
