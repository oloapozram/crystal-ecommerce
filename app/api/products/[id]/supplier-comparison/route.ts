import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const productId = parseInt(id);

    const purchases = await prisma.inventoryPurchase.findMany({
        where: { productId },
        include: { supplier: true },
    });

    // Group by supplier
    const supplierStats = purchases.reduce((acc, purchase) => {
        const supplierId = purchase.supplierId;
        const supplierName = purchase.supplier.name;

        if (!acc[supplierId]) {
            acc[supplierId] = {
                supplierId,
                supplierName,
                purchases: [],
                totalCost: 0,
                totalWeight: 0,
                qualityRatings: [],
            };
        }

        // Handle Decimal types
        const costTotal = Number(purchase.costTotal);
        const weightGrams = Number(purchase.weightGrams);

        acc[supplierId].purchases.push(purchase);
        acc[supplierId].totalCost += costTotal;
        acc[supplierId].totalWeight += weightGrams;

        if (purchase.qualityRating) {
            acc[supplierId].qualityRatings.push(purchase.qualityRating);
        }

        return acc;
    }, {} as Record<number, any>);

    // Calculate averages and value scores
    const comparison = Object.values(supplierStats).map((stat: any) => {
        const avgCostPerGram = stat.totalCost / stat.totalWeight;
        const avgQuality = stat.qualityRatings.length > 0
            ? stat.qualityRatings.reduce((sum: number, r: number) => sum + r, 0) / stat.qualityRatings.length
            : null;

        // Value score = Quality / Cost (higher is better)
        // If no quality rating, assume average (3/5) for calculation or just 0
        const scoreQuality = avgQuality || 3;
        const valueScore = avgCostPerGram > 0 ? scoreQuality / avgCostPerGram : 0;

        const lastPurchase = stat.purchases.sort(
            (a: any, b: any) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        )[0];

        return {
            supplierName: stat.supplierName,
            purchaseCount: stat.purchases.length,
            avgCostPerGram: parseFloat(avgCostPerGram.toFixed(4)),
            avgQuality: avgQuality ? parseFloat(avgQuality.toFixed(2)) : null,
            valueScore: parseFloat(valueScore.toFixed(2)),
            lastPurchaseDate: lastPurchase.purchaseDate,
        };
    });

    // Sort by value score descending
    comparison.sort((a, b) => b.valueScore - a.valueScore);

    return NextResponse.json(comparison);
}
