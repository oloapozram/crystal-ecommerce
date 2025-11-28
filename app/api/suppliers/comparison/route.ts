import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { error: 'productId query parameter required' },
      { status: 400 }
    );
  }

  const prodId = parseInt(productId);

  // Get actual purchase history
  const purchases = await prisma.inventoryPurchase.findMany({
    where: { productId: prodId },
    include: { supplier: true },
  });

  // Get prospect quotes
  const quotes = await prisma.supplierQuote.findMany({
    where: {
      productId: prodId,
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
    include: { supplier: true },
  });

  // Group purchases by supplier
  const purchaseStats = purchases.reduce((acc, purchase) => {
    const sid = purchase.supplierId;

    if (!acc[sid]) {
      acc[sid] = {
        supplierId: sid,
        supplierName: purchase.supplier.name,
        purchases: [],
        totalCost: 0,
        totalWeight: 0,
        qualityRatings: [],
      };
    }

    acc[sid].purchases.push(purchase);
    acc[sid].totalCost += purchase.costTotal.toNumber();
    acc[sid].totalWeight += purchase.weightGrams.toNumber();

    if (purchase.qualityRating) {
      acc[sid].qualityRatings.push(purchase.qualityRating);
    }

    return acc;
  }, {} as Record<number, any>);

  // Group quotes by supplier
  const quoteStats = quotes.reduce((acc, quote) => {
    const sid = quote.supplierId;

    if (!acc[sid]) {
      acc[sid] = {
        supplierId: sid,
        supplierName: quote.supplier.name,
        quotes: [],
      };
    }

    acc[sid].quotes.push({
      id: quote.id,
      quotedPricePerGram: quote.quotedPricePerGram.toNumber(),
      estimatedQualityRating: quote.estimatedQualityRating,
      minimumOrderGrams: quote.minimumOrderGrams?.toNumber(),
      expiresAt: quote.expiresAt,
      status: quote.status,
      notes: quote.notes,
    });

    return acc;
  }, {} as Record<number, any>);

  // Merge and calculate comparison
  const allSupplierIds = new Set([
    ...Object.keys(purchaseStats).map(Number),
    ...Object.keys(quoteStats).map(Number),
  ]);

  const comparison = Array.from(allSupplierIds).map((supplierId) => {
    const purchaseStat = purchaseStats[supplierId];
    const quoteStat = quoteStats[supplierId];

    let actualPerformance = null;
    if (purchaseStat) {
      const avgCostPerGram = purchaseStat.totalCost / purchaseStat.totalWeight;
      const avgQuality = purchaseStat.qualityRatings.length > 0
        ? purchaseStat.qualityRatings.reduce((sum: number, r: number) => sum + r, 0) /
          purchaseStat.qualityRatings.length
        : null;

      const valueScore = avgQuality ? avgQuality / avgCostPerGram : 0;

      actualPerformance = {
        purchaseCount: purchaseStat.purchases.length,
        avgCostPerGram: parseFloat(avgCostPerGram.toFixed(4)),
        avgQuality: avgQuality ? parseFloat(avgQuality.toFixed(2)) : null,
        valueScore: parseFloat(valueScore.toFixed(2)),
      };
    }

    const prospectQuotes = quoteStat?.quotes || [];

    // Calculate best prospect value if quotes exist
    let bestProspectValue = null;
    if (prospectQuotes.length > 0) {
      const validQuotes = prospectQuotes.filter(
        (q: any) => q.estimatedQualityRating && q.quotedPricePerGram
      );

      if (validQuotes.length > 0) {
        const prospectScores = validQuotes.map((q: any) => ({
          pricePerGram: q.quotedPricePerGram,
          estimatedQuality: q.estimatedQualityRating,
          prospectValueScore: q.estimatedQualityRating / q.quotedPricePerGram,
        }));

        const best = prospectScores.reduce((prev, curr) =>
          curr.prospectValueScore > prev.prospectValueScore ? curr : prev
        );

        bestProspectValue = {
          quotedPricePerGram: best.pricePerGram,
          estimatedQuality: best.estimatedQuality,
          prospectValueScore: parseFloat(best.prospectValueScore.toFixed(2)),
        };
      }
    }

    return {
      supplierId,
      supplierName: purchaseStat?.supplierName || quoteStat?.supplierName,
      actualPerformance,
      prospectQuotes,
      bestProspectValue,
      // Overall score for ranking (prefer actual, fallback to prospect)
      overallScore: actualPerformance?.valueScore || bestProspectValue?.prospectValueScore || 0,
    };
  });

  // Sort by overall score descending
  comparison.sort((a, b) => b.overallScore - a.overallScore);

  return NextResponse.json(comparison);
}
