# Media Upload and Social Media Links Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add product image upload functionality with local storage and social media link management for Instagram, TikTok, YouTube, and other platforms.

**Architecture:** Extend existing MediaFile model to support both local uploads and external social media URLs. Use Next.js API routes for file upload handling. Add admin UI for managing both types of media.

**Tech Stack:** React 19, Next.js 15 App Router, TypeScript, Prisma, multer/formidable for uploads, shadcn/ui components

---

## Task 1: Update Database Schema for External Media Links

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/[timestamp]_add_external_media_support/migration.sql`

**Step 1: Add MediaPlatform enum**

Update `prisma/schema.prisma` to add platform enum:

```prisma
enum MediaPlatform {
  LOCAL      @map("local")
  INSTAGRAM  @map("instagram")
  TIKTOK     @map("tiktok")
  YOUTUBE    @map("youtube")
  FACEBOOK   @map("facebook")
  TWITTER    @map("twitter")
  OTHER      @map("other")
}
```

**Step 2: Update MediaFile model**

Modify the MediaFile model:

```prisma
model MediaFile {
  id           Int            @id @default(autoincrement())
  productId    Int            @map("product_id")
  filePath     String?        @map("file_path") @db.VarChar(500)  // Now nullable
  externalUrl  String?        @map("external_url") @db.VarChar(1000)
  platform     MediaPlatform  @default(LOCAL)
  fileType     FileType       @map("file_type")
  isPrimary    Boolean        @default(false) @map("is_primary")
  platformTags Json?          @map("platform_tags")
  displayOrder Int            @default(0) @map("display_order")
  caption      String?        @db.VarChar(500)
  createdAt    DateTime       @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([platform])
  @@map("media_files")
}
```

**Step 3: Create migration**

```bash
npx prisma migrate dev --name add_external_media_support
```

Expected: Migration created successfully

**Step 4: Verify migration**

```bash
npx prisma db push
npx prisma generate
```

Expected: Schema updated, client regenerated

**Step 5: Commit**

```bash
git add prisma/
git commit -m "feat: add external media platform support to schema"
```

---

## Task 2: Create Image Upload API Endpoint

**Files:**
- Create: `app/api/products/[id]/media/upload/route.ts`
- Create: `lib/upload-handler.ts`

**Step 1: Install upload dependencies**

```bash
npm install formidable
npm install -D @types/formidable
```

**Step 2: Create upload handler utility**

Create `lib/upload-handler.ts`:

```typescript
import { IncomingMessage } from 'http';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export interface UploadedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export async function parseFormData(req: IncomingMessage): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
}> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');

  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filter: ({ mimetype }) => {
      return mimetype?.startsWith('image/') || false;
    },
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export function getPublicPath(filepath: string): string {
  const uploadsIndex = filepath.indexOf('/uploads/');
  return uploadsIndex >= 0 ? filepath.substring(uploadsIndex) : filepath;
}
```

**Step 3: Create upload API route**

Create `app/api/products/[id]/media/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseFormData, getPublicPath } from '@/lib/upload-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Parse form data with file upload
    const { files } = await parseFormData(request as any);

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
    const createdMedia = [];

    for (const file of uploadedFiles) {
      if (!file) continue;

      const publicPath = getPublicPath(file.filepath);

      const mediaFile = await prisma.mediaFile.create({
        data: {
          productId,
          filePath: publicPath,
          platform: 'LOCAL',
          fileType: 'IMAGE',
          displayOrder: 0,
        },
      });

      createdMedia.push(mediaFile);
    }

    return NextResponse.json({
      success: true,
      files: createdMedia,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
```

**Step 4: Test upload endpoint**

```bash
npm run dev
# Test with curl or Postman
curl -X POST http://localhost:3000/api/products/1/media/upload \
  -F "file=@test-image.jpg"
```

Expected: File uploaded and database record created

**Step 5: Commit**

```bash
git add app/api/products/[id]/media/upload/ lib/upload-handler.ts package.json
git commit -m "feat: add image upload API endpoint"
```

---

## Task 3: Create Social Media Link API Endpoint

**Files:**
- Create: `app/api/products/[id]/media/external/route.ts`
- Create: `lib/validation/media.ts`

**Step 1: Create validation schema**

Create `lib/validation/media.ts`:

```typescript
import { z } from 'zod';

export const externalMediaSchema = z.object({
  externalUrl: z.string().url('Invalid URL'),
  platform: z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'OTHER']),
  fileType: z.enum(['IMAGE', 'VIDEO']),
  caption: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export type ExternalMediaData = z.infer<typeof externalMediaSchema>;
```

**Step 2: Create external media API route**

Create `app/api/products/[id]/media/external/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { externalMediaSchema } from '@/lib/validation/media';

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
```

**Step 3: Test external media endpoint**

```bash
curl -X POST http://localhost:3000/api/products/1/media/external \
  -H "Content-Type: application/json" \
  -d '{
    "externalUrl": "https://www.instagram.com/p/example",
    "platform": "INSTAGRAM",
    "fileType": "IMAGE",
    "caption": "Check out this crystal!"
  }'
```

Expected: External media link created in database

**Step 4: Commit**

```bash
git add app/api/products/[id]/media/external/ lib/validation/media.ts
git commit -m "feat: add social media link management API"
```

---

## Task 4: Create Media Management UI Component

**Files:**
- Create: `components/admin/media-manager.tsx`
- Create: `components/admin/upload-button.tsx`
- Create: `components/admin/external-media-form.tsx`

**Step 1: Create upload button component**

Create `components/admin/upload-button.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface UploadButtonProps {
  productId: number;
  onUploadComplete: () => void;
}

export function UploadButton({ productId, onUploadComplete }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('file', file);
    });

    try {
      const response = await fetch(`/api/products/${productId}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: 'Success',
        description: `${files.length} file(s) uploaded successfully`,
      });

      onUploadComplete();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload Images'}
      </Button>
    </div>
  );
}
```

**Step 2: Create external media form**

Create `components/admin/external-media-form.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { externalMediaSchema, ExternalMediaData } from '@/lib/validation/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface ExternalMediaFormProps {
  productId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExternalMediaForm({ productId, onSuccess, onCancel }: ExternalMediaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExternalMediaData>({
    resolver: zodResolver(externalMediaSchema),
    defaultValues: {
      platform: 'INSTAGRAM',
      fileType: 'IMAGE',
      isPrimary: false,
    },
  });

  const onSubmit = async (data: ExternalMediaData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/media/external`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to add media');

      toast({
        title: 'Success',
        description: 'Social media link added successfully',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add social media link',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="externalUrl">URL *</Label>
        <Input
          id="externalUrl"
          {...register('externalUrl')}
          placeholder="https://www.instagram.com/p/..."
        />
        {errors.externalUrl && (
          <p className="text-sm text-destructive mt-1">{errors.externalUrl.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="platform">Platform *</Label>
        <Select
          onValueChange={(value) => setValue('platform', value as any)}
          defaultValue="INSTAGRAM"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
            <SelectItem value="TIKTOK">TikTok</SelectItem>
            <SelectItem value="YOUTUBE">YouTube</SelectItem>
            <SelectItem value="FACEBOOK">Facebook</SelectItem>
            <SelectItem value="TWITTER">Twitter/X</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="fileType">Media Type *</Label>
        <Select
          onValueChange={(value) => setValue('fileType', value as any)}
          defaultValue="IMAGE"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IMAGE">Image</SelectItem>
            <SelectItem value="VIDEO">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="caption">Caption (optional)</Label>
        <Textarea
          id="caption"
          {...register('caption')}
          placeholder="Add a caption or description..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPrimary"
          onCheckedChange={(checked) => setValue('isPrimary', checked as boolean)}
        />
        <Label htmlFor="isPrimary" className="font-normal">
          Set as primary media
        </Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Link'}
        </Button>
      </div>
    </form>
  );
}
```

**Step 3: Create media manager component**

Create `components/admin/media-manager.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UploadButton } from './upload-button';
import { ExternalMediaForm } from './external-media-form';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: number;
  filePath: string | null;
  externalUrl: string | null;
  platform: string;
  fileType: string;
  caption: string | null;
  isPrimary: boolean;
}

interface MediaManagerProps {
  productId: number;
}

export function MediaManager({ productId }: MediaManagerProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExternalForm, setShowExternalForm] = useState(false);
  const { toast } = useToast();

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/media/external`);
      if (!response.ok) throw new Error('Failed to fetch media');
      const data = await response.json();
      setMediaFiles(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load media files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [productId]);

  const handleDelete = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(
        `/api/products/${productId}/media/external?mediaId=${mediaId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: 'Success',
        description: 'Media deleted successfully',
      });

      fetchMedia();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Product Media</CardTitle>
          <div className="flex gap-2">
            <UploadButton productId={productId} onUploadComplete={fetchMedia} />
            <Dialog open={showExternalForm} onOpenChange={setShowExternalForm}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Social Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Social Media Link</DialogTitle>
                </DialogHeader>
                <ExternalMediaForm
                  productId={productId}
                  onSuccess={() => {
                    setShowExternalForm(false);
                    fetchMedia();
                  }}
                  onCancel={() => setShowExternalForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading media...</p>
        ) : mediaFiles.length === 0 ? (
          <p className="text-muted-foreground">No media files yet. Upload images or add social links.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaFiles.map((media) => (
              <div key={media.id} className="relative group border rounded-lg p-2">
                {media.platform === 'LOCAL' && media.filePath ? (
                  <div className="relative aspect-square">
                    <Image
                      src={media.filePath}
                      alt={media.caption || 'Product image'}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                    <div className="text-center p-2">
                      <ExternalLink className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs font-medium">{media.platform}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {media.fileType}
                      </p>
                    </div>
                  </div>
                )}

                {media.isPrimary && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}

                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(media.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {media.externalUrl && (
                  <a
                    href={media.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 block truncate"
                  >
                    View on {media.platform}
                  </a>
                )}

                {media.caption && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {media.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 4: Add to product edit page**

Modify `app/admin/products/[id]/edit/page.tsx` or similar to include:

```typescript
import { MediaManager } from '@/components/admin/media-manager';

// In the page component:
<MediaManager productId={productId} />
```

**Step 5: Test media manager**

```bash
npm run dev
```

Navigate to product edit page and test:
- Upload images
- Add social media links
- Delete media
- Set primary media

Expected: All functionality works

**Step 6: Commit**

```bash
git add components/admin/
git commit -m "feat: add media manager UI with upload and social links"
```

---

## Task 5: Display Media on Public Product Pages

**Files:**
- Create: `components/products/product-gallery.tsx`
- Modify: `app/(public)/products/[id]/page.tsx`

**Step 1: Create product gallery component**

Create `components/products/product-gallery.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MediaFile {
  id: number;
  filePath: string | null;
  externalUrl: string | null;
  platform: string;
  fileType: string;
  caption: string | null;
}

interface ProductGalleryProps {
  media: MediaFile[];
  productName: string;
}

export function ProductGallery({ media, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const localImages = media.filter(m => m.platform === 'LOCAL' && m.filePath);
  const externalLinks = media.filter(m => m.platform !== 'LOCAL' && m.externalUrl);

  if (localImages.length === 0 && externalLinks.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  const currentImage = localImages[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      {currentImage && (
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
          <Image
            src={currentImage.filePath!}
            alt={currentImage.caption || productName}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Thumbnail Grid */}
      {localImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {localImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded border-2 overflow-hidden ${
                index === selectedIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image
                src={img.filePath!}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Social Media Links */}
      {externalLinks.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">See this product on:</h3>
          <div className="flex flex-wrap gap-2">
            {externalLinks.map((link) => (
              <a
                key={link.id}
                href={link.externalUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {link.platform === 'INSTAGRAM' && '📷 Instagram'}
                  {link.platform === 'TIKTOK' && '🎵 TikTok'}
                  {link.platform === 'YOUTUBE' && '▶️ YouTube'}
                  {link.platform === 'FACEBOOK' && '👍 Facebook'}
                  {link.platform === 'TWITTER' && '🐦 Twitter'}
                  {link.platform === 'OTHER' && `🔗 ${link.fileType}`}
                </Badge>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update product detail page to fetch and display media**

Modify product page to include media in query and render gallery

**Step 3: Test on frontend**

```bash
npm run dev
```

Navigate to product pages and verify:
- Images display correctly
- Social links are visible and clickable
- Gallery navigation works

Expected: All media displays properly

**Step 4: Commit**

```bash
git add components/products/product-gallery.tsx app/(public)/products/
git commit -m "feat: add product gallery with social media links display"
```

---

## Execution Notes

**DRY Principles:**
- Reuse existing MediaFile model
- Leverage shadcn/ui components
- Share validation schemas between API and components

**YAGNI Principles:**
- No complex image processing (crop, resize, etc.)
- No CDN integration initially (local storage first)
- No video upload (external links only for now)
- No media analytics

**Security:**
- File size limits (10MB)
- File type validation (images only)
- URL validation for external links
- Product ownership verification

**Testing:**
- Manual testing for file upload
- Manual testing for external links
- Verify database constraints

---

**Last Updated:** 2025-12-06
**Status:** Ready for implementation
