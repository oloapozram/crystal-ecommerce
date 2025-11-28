import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quote = await prisma.supplierQuote.findUnique({
    where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const quote = await prisma.supplierQuote.update({
    where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  await prisma.supplierQuote.delete({
    where: { id: parseInt(params.id) },
  });

  return NextResponse.json({ success: true });
}
