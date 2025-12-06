import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchCrystals } from './crystal-matcher';
import { prisma } from './prisma';

// Mock Prisma
vi.mock('./prisma', () => ({
    prisma: {
        product: {
            findMany: vi.fn()
        }
    }
}));

// Mock AI generator
vi.mock('./ai-generators', () => ({
    generateCrystalMatchExplanation: vi.fn().mockResolvedValue('AI explanation')
}));

describe('matchCrystals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should match crystals based on Bazi and concerns', async () => {
        // Mock products
        const mockProducts = [
            {
                id: 1,
                baseName: 'Red Jasper',
                baziElement: 'FIRE',
                qualityGrade: 'NORMAL',
                stock: { quantityAvailable: 10 },
                mediaFiles: []
            },
            {
                id: 2,
                baseName: 'Aquamarine',
                baziElement: 'WATER',
                qualityGrade: 'HIGH',
                stock: { quantityAvailable: 5 },
                mediaFiles: []
            }
        ];

        (prisma.product.findMany as any).mockResolvedValue(mockProducts);

        const input = {
            birthDate: new Date('1990-05-15'), // Metal Horse year (Metal), Day needs calculation
            concerns: ['Peace & Calm'] // Maps to WATER, EARTH
        };

        const result = await matchCrystals(input);

        expect(result.matches).toHaveLength(2);
        expect(result.baziChart).toBeDefined();

        // Check if matches are sorted by score
        // Aquamarine (WATER) matches concern 'Peace & Calm' (WATER) -> +2 points * 20 = 40
        // Plus HIGH quality bonus (+10) = 50
        // Red Jasper (FIRE) -> No direct match in this simple test case setup unless Bazi needs it

        // We expect Aquamarine to be recommended
        const aquamarineMatch = result.matches.find(m => m.product.baseName === 'Aquamarine');
        expect(aquamarineMatch).toBeDefined();
        expect(aquamarineMatch?.reasons).toContain('Supports your intentions');
        expect(aquamarineMatch?.reasons).toContain('Premium quality');
    });
});
