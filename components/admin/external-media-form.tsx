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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add media');
      }

      toast({
        title: 'Success',
        description: 'Social media link added successfully',
      });
      onSuccess();
    } catch (error) {
      console.error('Add media error:', error);
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
