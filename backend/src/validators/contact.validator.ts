import { z } from 'zod';

const plain = (min: number, max: number) => z.string().trim().min(min).max(max)
  .refine((value) => !/[<>]/.test(value), 'HTML is not allowed.');
const singleLine = (min: number, max: number) => plain(min, max)
  .refine((value) => !/[\r\n\u0000-\u001f\u007f]/.test(value), 'Control characters are not allowed.');

export const contactRequestSchema = z.object({
  fullName: singleLine(2, 100),
  email: z.string().trim().toLowerCase().email().max(254),
  category: z.enum([
    'GENERAL', 'TECHNICAL', 'CONTENT_REPORT', 'COPYRIGHT',
    'PARTNERSHIP', 'FEATURE_REQUEST', 'ACCOUNT_HELP'
  ]),
  subject: singleLine(3, 150),
  message: plain(10, 3000),
  resourceUrl: z.string().trim().url().max(500)
    .refine((value) => /^https?:\/\//i.test(value), 'Only HTTP(S) URLs are allowed.')
    .optional().or(z.literal('')),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required.' }) }),
  website: z.string().max(200).optional().default('')
});

export const contactStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM'])
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
