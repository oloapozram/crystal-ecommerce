import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { saveUploadedFile, validateImageFile } from '@/lib/upload-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const productId = parseInt(params.id);

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

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const createdMedia = [];
    const errors = [];

    for (const fileData of files) {
      if (!(fileData instanceof File)) {
        errors.push({ filename: 'unknown', error: 'Invalid file data' });
        continue;
      }

      // Validate file
      const validation = validateImageFile(fileData);
      if (!validation.valid) {
        errors.push({ filename: fileData.name, error: validation.error });
        continue;
      }

      try {
        // Save file
        const uploadResult = await saveUploadedFile(fileData);

        // Create database record
        const mediaFile = await prisma.mediaFile.create({
          data: {
            productId,
            filePath: uploadResult.publicPath,
            platform: 'LOCAL',
            fileType: 'IMAGE',
            displayOrder: 0,
          },
        });

        createdMedia.push(mediaFile);
      } catch (error) {
        console.error('File upload error:', error);
        errors.push({ filename: fileData.name, error: 'Failed to upload file' });
      }
    }

    return NextResponse.json({
      success: createdMedia.length > 0,
      files: createdMedia,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
