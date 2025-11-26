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
  purchases: Array<{ costTotal: number; weightGrams: number }>
): number {
  const totalCost = purchases.reduce((sum, p) => sum + p.costTotal, 0);
  const totalWeight = purchases.reduce((sum, p) => sum + p.weightGrams, 0);

  return totalWeight > 0 ? totalCost / totalWeight : 0;
}
