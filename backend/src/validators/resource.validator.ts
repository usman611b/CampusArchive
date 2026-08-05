import { z } from 'zod';

export const createPreSignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSizeBytes: z.number().positive('File size must be positive'),
  courseId: z.string().uuid('Invalid course UUID')
});

export const createResourceSchema = z.object({
  courseId: z.string().uuid('Invalid course UUID'),
  chapterId: z.string().uuid('Invalid chapter UUID').optional(),
  categoryId: z.string().uuid('Invalid category UUID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  fileStoragePath: z.string().optional(),
  fileHash: z.string().optional(),
  fileBase64: z.string().optional(),
  mimeType: z.string().optional(),
  fileSizeBytes: z.number().nonnegative().optional(),
  version: z.string().default('1.0'),
  tags: z.array(z.string()).optional().default([])
});

export const rateResourceSchema = z.object({
  stars: z.number().int().min(1).max(5),
  reviewText: z.string().max(500).optional()
});

export type CreatePreSignedUrlInput = z.infer<typeof createPreSignedUrlSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type RateResourceInput = z.infer<typeof rateResourceSchema>;
