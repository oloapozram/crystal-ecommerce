export interface PricingResult {
  costPerGram: number;
  retailPerGram: number;
  totalRetailPrice: number;
  markup: number;
}

export function calculateRetailPrice(
  costPerGram: number,
  markupPercentage: number,
  weightGrams: number
): PricingResult {
  const retailPerGram = costPerGram * (1 + markupPercentage / 100);
  const totalRetailPrice = parseFloat((retailPerGram * weightGrams).toFixed(2));

  return {
    costPerGram: parseFloat(costPerGram.toFixed(4)),
    retailPerGram: parseFloat(retailPerGram.toFixed(4)),
    totalRetailPrice,
    markup: markupPercentage,
  };
}

export function calculateWeightedAvgCost(
  purchases: Array<{ costTotal: number | any; weightGrams: number | any }>
): number {
  // Handle Prisma Decimal types by converting to number if needed
  const cleanPurchases = purchases.map(p => ({
    costTotal: Number(p.costTotal),
    weightGrams: Number(p.weightGrams)
  }));

  const totalCost = cleanPurchases.reduce((sum, p) => sum + p.costTotal, 0);
  const totalWeight = cleanPurchases.reduce((sum, p) => sum + p.weightGrams, 0);

  return totalWeight > 0 ? totalCost / totalWeight : 0;
}
