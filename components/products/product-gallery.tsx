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
