import { z } from 'zod';

export const externalMediaSchema = z.object({
  externalUrl: z.string().url('Invalid URL'),
  platform: z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'OTHER']),
  fileType: z.enum(['IMAGE', 'VIDEO']),
  caption: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export type ExternalMediaData = z.infer<typeof externalMediaSchema>;
