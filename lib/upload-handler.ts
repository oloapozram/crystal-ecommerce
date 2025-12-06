import fs from 'fs/promises';
import path from 'path';

export interface UploadResult {
  filepath: string;
  publicPath: string;
  filename: string;
  size: number;
}

export async function saveUploadedFile(file: File): Promise<UploadResult> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');

  // Ensure upload directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = path.extname(file.name);
  const filename = `${timestamp}-${randomString}${extension}`;

  const filepath = path.join(uploadsDir, filename);
  const publicPath = `/uploads/products/${filename}`;

  // Convert File to Buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await fs.writeFile(filepath, buffer);

  return {
    filepath,
    publicPath,
    filename,
    size: file.size,
  };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}
