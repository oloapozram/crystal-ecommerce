import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRetailPrice } from '@/lib/pricing';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const avgCost = product.stock?.avgCostPerGram || 0;
  const pricing = calculateRetailPrice(avgCost, 40, product.stock?.weightGramsAvailable || 0);

  return NextResponse.json({
    ...product,
    pricing,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const body = await request.json();

  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: body,
  });

  return NextResponse.json(product);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
