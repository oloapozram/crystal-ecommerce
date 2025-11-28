import { describe, it, expect, beforeAll } from 'vitest';
import { generateBaziSellingCopy } from './ai-generators';
import { prisma } from './prisma';

describe('generateBaziSellingCopy', () => {
    let testProductId: number;

    beforeAll(async () => {
        // Get a test product from the database
        const product = await prisma.product.findFirst({
            where: { baseName: 'Amethyst' }
        });
        testProductId = product!.id;
    });

    it('should generate selling copy for a product without user chart', async () => {
        const result = await generateBaziSellingCopy(testProductId);

        expect(result).toHaveProperty('selling_copy');
        expect(result).toHaveProperty('element_analysis');
        expect(result).toHaveProperty('recommended_for');
        expect(result).toHaveProperty('source_facts_used');
        expect(result).toHaveProperty('confidence_score');

        expect(typeof result.selling_copy).toBe('string');
        expect(result.selling_copy.length).toBeGreaterThan(100);
        expect(result.confidence_score).toBeGreaterThan(0);
        expect(result.confidence_score).toBeLessThanOrEqual(1);
    });

    it('should generate personalized copy with user Bazi chart', async () => {
        const userChart = {
            birthYear: 1990,
            animal: 'Horse',
            element: 'metal',
            dominantElement: 'metal',
            needsBalance: ['fire', 'wood'],
            strengths: ['metal', 'earth']
        };

        const result = await generateBaziSellingCopy(testProductId, userChart);

        expect(result.selling_copy).toContain('metal');
        expect(result.recommended_for).toBeTruthy();
    });
});
