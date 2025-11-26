import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRetailPrice } from '@/lib/pricing';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const element = searchParams.get('element');
  const quality = searchParams.get('quality');
  const inStock = searchParams.get('in_stock') === 'true';

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(element && { baziElement: element.toUpperCase() }),
      ...(quality && { qualityGrade: quality.toUpperCase() }),
      ...(inStock && {
        stock: {
          quantityAvailable: { gt: 0 },
        },
      }),
    },
    include: {
      stock: true,
      mediaFiles: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const productsWithPricing = products.map((product) => {
    const avgCost = product.stock?.avgCostPerGram || 0;
    const pricing = calculateRetailPrice(avgCost, 40, product.sizeMm);

    return {
      id: product.id,
      sku: product.sku,
      name: `${product.baseName} ${product.sizeMm}mm ${product.qualityGrade}`,
      baseName: product.baseName,
      size: product.sizeMm,
      quality: product.qualityGrade,
      element: product.baziElement,
      pricePerGram: pricing.retailPerGram,
      retailPrice: pricing.totalRetailPrice,
      stockAvailable: product.stock?.quantityAvailable || 0,
      primaryImage: product.mediaFiles[0]?.filePath || null,
    };
  });

  return NextResponse.json(productsWithPricing);
}

export async function POST(request: Request) {
  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      baseName: body.baseName,
      sizeMm: body.sizeMm,
      qualityGrade: body.qualityGrade,
      sku: body.sku || generateSKU(body.baseName, body.sizeMm, body.qualityGrade),
      baziElement: body.baziElement,
      metaphysicalProperties: body.metaphysicalProperties,
      description: body.description,
    },
  });

  return NextResponse.json(product, { status: 201 });
}

function generateSKU(baseName: string, size: number, quality: string): string {
  const nameSlug = baseName
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');

  return `${nameSlug}-${size}MM-${quality}`;
}
