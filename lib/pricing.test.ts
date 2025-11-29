import { describe, it, expect } from 'vitest';
import { calculateRetailPrice, calculateWeightedAvgCost } from './pricing';

describe('calculateRetailPrice', () => {
    it('should calculate retail price with markup', () => {
        const costPerGram = 0.25;
        const markupPercentage = 40;
        const weightGrams = 20;

        const result = calculateRetailPrice(costPerGram, markupPercentage, weightGrams);

        expect(result.costPerGram).toBe(0.25);
        expect(result.retailPerGram).toBe(0.35);
        expect(result.totalRetailPrice).toBe(7.00);
    });
});

describe('calculateWeightedAvgCost', () => {
    it('should calculate weighted average cost correctly', () => {
        const purchases = [
            { costTotal: 100, weightGrams: 50 }, // $2/g
            { costTotal: 300, weightGrams: 100 } // $3/g
        ];
        // Total Cost: 400, Total Weight: 150 => 2.666...

        const result = calculateWeightedAvgCost(purchases);
        expect(result).toBeCloseTo(2.6667, 4);
    });

    it('should handle zero weight to avoid division by zero', () => {
        const result = calculateWeightedAvgCost([]);
        expect(result).toBe(0);
    });
});
