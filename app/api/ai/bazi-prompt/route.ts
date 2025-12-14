import { NextRequest, NextResponse } from 'next/server';
import { generateBaziSellingCopy } from '@/lib/ai-generators';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, userBaziChart } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        const result = await generateBaziSellingCopy(productId, userBaziChart || null);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error generating Bazi selling copy:', error);
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        );
    }
}
