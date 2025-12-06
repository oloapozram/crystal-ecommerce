import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { externalMediaSchema } from '@/lib/validation/media';
import { z } from 'zod';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const body = await request.json();

    // Validate input
    const validated = externalMediaSchema.parse(body);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary media
    if (validated.isPrimary) {
      await prisma.mediaFile.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create external media link
    const mediaFile = await prisma.mediaFile.create({
      data: {
        productId,
        externalUrl: validated.externalUrl,
        platform: validated.platform,
        fileType: validated.fileType,
        caption: validated.caption,
        isPrimary: validated.isPrimary,
        displayOrder: 0,
      },
    });

    return NextResponse.json(mediaFile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('External media error:', error);
    return NextResponse.json(
      { error: 'Failed to add external media' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    const mediaFiles = await prisma.mediaFile.findMany({
      where: { productId },
      orderBy: [
        { isPrimary: 'desc' },
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error('Fetch media error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID required' },
        { status: 400 }
      );
    }

    await prisma.mediaFile.delete({
      where: { id: parseInt(mediaId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
