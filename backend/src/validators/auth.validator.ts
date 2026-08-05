import { z } from 'zod';

const optionalUuid = z.union([z.string().uuid(), z.literal(''), z.null()]).optional().transform((val) => (val === '' || val === null ? undefined : val));

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
  universityName: z.string().optional().default('Lahore Garrison University'),
  departmentId: optionalUuid,
  programId: optionalUuid,
  semesterId: optionalUuid
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  username: z.string().min(3).max(30).optional(),
  universityName: z.string().optional(),
  departmentId: optionalUuid,
  programId: optionalUuid,
  semesterId: optionalUuid,
  bio: z.string().max(500).optional(),
  avatarUrl: z.union([z.string(), z.literal(''), z.null()]).optional().transform((val) => (val === '' || val === null ? undefined : val))
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
