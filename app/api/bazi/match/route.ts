import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBaziChart } from '@/lib/bazi/calculator';
import { matchCrystalsToChart } from '@/lib/bazi/matching';
import { calculateRetailPrice } from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthYear } = body;

    if (!birthYear || typeof birthYear !== 'number') {
      return NextResponse.json(
        { error: 'birthYear is required and must be a number' },
        { status: 400 }
      );
    }

    // Calculate user's Bazi chart
    const baziChart = calculateBaziChart(birthYear);

    // Get available products with stock
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        baziElement: { not: null },
        stock: {
          quantityAvailable: { gt: 0 },
        },
      },
      include: {
        stock: true,
        mediaFiles: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    // Calculate pricing for each product
    const productsWithPricing = products.map((product) => {
      const avgCost = product.stock?.avgCostPerGram?.toNumber() || 0;
      const weight = product.stock?.weightGramsAvailable?.toNumber() || 0;
      const pricing = calculateRetailPrice(avgCost, 40, weight);

      return {
        id: product.id,
        baseName: product.baseName,
        sizeMm: product.sizeMm.toNumber(),
        qualityGrade: product.qualityGrade,
        baziElement: product.baziElement,
        pricing,
        stockAvailable: product.stock?.quantityAvailable || 0,
        primaryImage: product.mediaFiles[0]?.filePath,
      };
    });

    // Match crystals to user's chart
    const recommendations = await matchCrystalsToChart(baziChart, productsWithPricing);

    return NextResponse.json({
      baziChart: {
        birthYear: baziChart.birthYear.year,
        animal: baziChart.birthYear.animal,
        element: baziChart.birthYear.element,
        dominantElement: baziChart.dominantElement,
        secondaryElement: baziChart.secondaryElement,
        needsBalance: baziChart.needsBalance,
        strengths: baziChart.strengths,
      },
      recommendations: recommendations.slice(0, 10), // Top 10 matches
      totalMatches: recommendations.length,
    });
  } catch (error) {
    console.error('Bazi matching error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Bazi match' },
      { status: 500 }
    );
  }
}
