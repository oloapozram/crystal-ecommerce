import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  const { id } = await params;
  const body = await request.json();

  const quote = await prisma.supplierQuote.update({
    where: { id: parseInt(id) },
    data: {
      ...body,
      ...(body.expiresAt && { expiresAt: new Date(body.expiresAt) }),
      ...(body.quoteDate && { quoteDate: new Date(body.quoteDate) }),
    },
    include: {
      supplier: true,
      product: true,
    },
  });

  return NextResponse.json(quote);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.supplierQuote.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
