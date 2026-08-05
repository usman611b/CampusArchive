import { z } from 'zod';

const plainText = (max: number) => z.string().trim().min(1).max(max)
  .refine((value) => !/[<>]/.test(value), 'HTML is not allowed.');

export const createRatingSchema = z.object({
  resourceId: z.string().uuid(),
  rating: z.number().int().min(1).max(5)
});

export const updateRatingSchema = z.object({ rating: z.number().int().min(1).max(5) });

export const createCommentSchema = z.object({
  resourceId: z.string().uuid(),
  parentCommentId: z.string().uuid().nullable().optional(),
  content: plainText(2000)
});

export const updateCommentSchema = z.object({ content: plainText(2000) });

export const lockCommentsSchema = z.object({ locked: z.boolean() });
