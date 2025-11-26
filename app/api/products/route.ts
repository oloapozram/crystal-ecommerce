import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const element = searchParams.get('element');
    const quality = searchParams.get('quality');
    const inStock = searchParams.get('in_stock') === 'true';

    // Build where clause
    const whereClause: any = {
      isActive: true,
    };

    if (element) {
      whereClause.baziElement = element.toUpperCase();
    }

    if (quality) {
      whereClause.qualityGrade = quality.toUpperCase();
    }

    if (inStock) {
      whereClause.stock = {
        quantityAvailable: { gt: 0 },
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        stock: true,
        mediaFiles: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform products with pricing calculation
    const productsWithPricing = products.map((product) => {
      // Calculate pricing from avgCostPerGram and markup
      const avgCostPerGram = product.stock?.avgCostPerGram?.toNumber() || 0;
      const markupPercentage = 40; // Default markup from schema
      const weightGrams = product.stock?.weightGramsAvailable?.toNumber() || 0;

      // Pricing formula: (costPerGram) * (1 + markupPercentage/100) * weightGrams
      const pricePerGram = avgCostPerGram * (1 + markupPercentage / 100);
      const retailPrice = pricePerGram * weightGrams;

      return {
        id: product.id,
        sku: product.sku,
        name: `${product.baseName} ${product.sizeMm}mm ${product.qualityGrade}`,
        baseName: product.baseName,
        size: product.sizeMm.toNumber(),
        quality: product.qualityGrade,
        element: product.baziElement,
        pricePerGram: parseFloat(pricePerGram.toFixed(4)),
        retailPrice: parseFloat(retailPrice.toFixed(2)),
        stockAvailable: product.stock?.quantityAvailable || 0,
        primaryImage: product.mediaFiles[0]?.filePath || null,
        description: product.description,
      };
    });

    return NextResponse.json(productsWithPricing);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

function generateSKU(baseName: string, size: number, quality: string): string {
  const nameSlug = baseName
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');

  return `${nameSlug}-${size}MM-${quality}`;
}
