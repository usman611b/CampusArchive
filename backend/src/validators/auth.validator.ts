import { z } from 'zod';

const optionalUuid = z.union([z.string().uuid(), z.literal(''), z.null()]).optional().transform((val) => (val === '' || val === null ? undefined : val));

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format').max(255),
  password: z.string()
    .min(12, 'Password must be at least 12 characters long')
    .max(128, 'Password is too long')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100).refine((value) => !/[<>]/.test(value), 'HTML is not allowed'),
  username: z.string().trim().toLowerCase().min(3, 'Username must be at least 3 characters').max(30, 'Username too long').regex(/^[a-z0-9._-]+$/, 'Username contains unsupported characters'),
  universityName: z.string().trim().max(255).refine((value) => !/[<>]/.test(value), 'HTML is not allowed').optional().default('Lahore Garrison University'),
  departmentId: optionalUuid,
  programId: optionalUuid,
  semesterId: optionalUuid
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format').max(255),
  password: z.string().min(1, 'Password is required').max(128)
});

const strongPassword = z.string()
  .min(12, 'Password must be at least 12 characters long')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: strongPassword
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: 'New password must be different from the current password.',
  path: ['newPassword']
});

export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(128)
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).refine((value) => !/[<>]/.test(value), 'HTML is not allowed').optional(),
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9._-]+$/).optional(),
  universityName: z.string().trim().max(255).refine((value) => !/[<>]/.test(value), 'HTML is not allowed').optional(),
  departmentId: optionalUuid,
  programId: optionalUuid,
  semesterId: optionalUuid,
  bio: z.string().trim().max(500).refine((value) => !/[<>]/.test(value), 'HTML is not allowed').optional(),
  avatarUrl: z.union([z.string().url().max(2048).refine((value) => /^https?:\/\//i.test(value), 'Avatar must use HTTP or HTTPS'), z.literal(''), z.null()]).optional().transform((val) => (val === '' || val === null ? undefined : val))
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
