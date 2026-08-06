import { z } from 'zod';

export const MAX_RESOURCE_FILE_BYTES = 50 * 1024 * 1024;
export const ALLOWED_RESOURCE_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
]);

const plainText = (min: number, max: number) => z.string().trim().min(min).max(max)
  .refine((value) => !/[<>]/.test(value), 'HTML is not allowed.');
const safeFileName = z.string().trim().min(1).max(255)
  .refine((value) => !/[\\/\0]/.test(value), 'Invalid file name.')
  .refine((value) => /\.(pdf|docx|pptx|txt|zip)$/i.test(value), 'Unsupported file extension.');
const allowedMimeType = z.string().refine((value) => ALLOWED_RESOURCE_MIME_TYPES.has(value.toLowerCase()), 'Unsupported file type.');

export const createPreSignedUrlSchema = z.object({
  fileName: safeFileName,
  fileType: allowedMimeType,
  fileSizeBytes: z.number().int().positive('File size must be positive').max(MAX_RESOURCE_FILE_BYTES, 'File size exceeds the 50 MB limit'),
  courseId: z.string().uuid('Invalid course UUID')
});

export const createResourceSchema = z.object({
  courseId: z.string().uuid('Invalid course UUID'),
  chapterId: z.string().uuid('Invalid chapter UUID').optional(),
  categoryId: z.string().uuid('Invalid category UUID'),
  title: plainText(3, 255),
  description: plainText(5, 5000),
  fileStoragePath: z.string().trim().min(1).max(1024),
  fileHash: z.string().regex(/^[a-f0-9]{64}$/i, 'Invalid SHA-256 file hash').optional(),
  mimeType: allowedMimeType,
  fileSizeBytes: z.number().int().positive().max(MAX_RESOURCE_FILE_BYTES),
  version: z.string().trim().regex(/^\d+(\.\d+){0,2}$/).default('1.0'),
  tags: z.array(plainText(1, 50)).max(10).optional().default([])
});

export const rateResourceSchema = z.object({
  stars: z.number().int().min(1).max(5),
  reviewText: z.string().max(500).optional()
});

export type CreatePreSignedUrlInput = z.infer<typeof createPreSignedUrlSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type RateResourceInput = z.infer<typeof rateResourceSchema>;
