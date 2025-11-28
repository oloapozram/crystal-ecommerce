/**
 * Calculate retail price based on cost and markup percentage
 */
export interface RetailPricing {
  costPerGram: number;
  markupPercent: number;
  retailPerGram: number;
  totalWeight: number;
  totalRetailPrice: number;
}

export function calculateRetailPrice(
  costPerGram: number,
  markupPercent: number,
  totalWeightGrams: number
): RetailPricing {
  const retailPerGram = costPerGram * (1 + markupPercent / 100);
  const totalRetailPrice = retailPerGram * totalWeightGrams;

  return {
    costPerGram,
    markupPercent,
    retailPerGram,
    totalWeight: totalWeightGrams,
    totalRetailPrice,
  };
}
