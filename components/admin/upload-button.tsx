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
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/products/${productId}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        toast({
          title: 'Partial Upload',
          description: `${result.files.length} file(s) uploaded. ${result.errors.length} failed.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `${result.files.length} file(s) uploaded successfully`,
        });
      }

      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
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
