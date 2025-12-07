'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UploadButton } from './upload-button';
import { ExternalMediaForm } from './external-media-form';

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
      console.error('Fetch media error:', error);
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
      console.error('Delete error:', error);
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
