import { NextRequest, NextResponse } from 'next/server';
import { generateVideoEditPrompt } from '@/lib/ai-generators';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, platform } = body;

        if (!productId || !platform) {
            return NextResponse.json(
                { error: 'productId and platform are required' },
                { status: 400 }
            );
        }

        if (!['tiktok', 'instagram', 'facebook'].includes(platform)) {
            return NextResponse.json(
                { error: 'platform must be one of: tiktok, instagram, facebook' },
                { status: 400 }
            );
        }

        const result = await generateVideoEditPrompt(productId, platform);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error generating video prompt:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate content' },
            { status: 500 }
        );
    }
}
