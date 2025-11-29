import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateBaziSellingCopy } from './ai-generators';

// Mock the AI SDKs
vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class {
            getGenerativeModel() {
                return {
                    generateContent: vi.fn().mockResolvedValue({
                        response: {
                            text: () => JSON.stringify({
                                selling_copy: "Mocked selling copy",
                                element_analysis: "Mocked analysis",
                                recommended_for: "Mocked recommendation",
                                source_facts_used: ["Fact 1"],
                                confidence_score: 0.99
                            })
                        }
                    })
                };
            }
        }
    };
});

// Mock Prisma
vi.mock('./prisma', () => ({
    prisma: {
        product: {
            findUnique: vi.fn()
        },
        aiGeneratedContent: {
            create: vi.fn()
        }
    }
}));

import { prisma } from './prisma';

describe('generateBaziSellingCopy', () => {
    beforeEach(async () => {
        // Mock prisma findUnique
        vi.mocked(prisma.product.findUnique).mockResolvedValue({
            id: 1,
            baseName: 'Amethyst',
            sizeMm: 10,
            qualityGrade: 'High',
            baziElement: 'Water',
            metaphysicalProperties: ['Calm', 'Peace'],
            mediaFiles: []
        } as any);

        // Mock prisma create
        vi.mocked(prisma.aiGeneratedContent.create).mockResolvedValue({} as any);

        // Set dummy API key
        process.env.GOOGLE_AI_API_KEY = 'dummy-key';
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete process.env.GOOGLE_AI_API_KEY;
    });

    it('should generate selling copy using mocked Gemini', async () => {
        const result = await generateBaziSellingCopy(1);

        expect(result).toHaveProperty('selling_copy');
        expect(result.selling_copy).toBe('Mocked selling copy');
        expect(result.confidence_score).toBe(0.99);
    });
});
