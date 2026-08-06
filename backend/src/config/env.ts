import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config(); // Fallback to root .env

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  FIRST_ADMIN_EMAIL: z.string().email().optional().or(z.literal('')),
  ENABLE_FIRST_ADMIN_BOOTSTRAP: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  RESEND_API_KEY: z.string().min(20).optional().or(z.literal('')),
  EMAIL_FROM: z.string().default('CampusArchive <notifications@usmanalii.com>'),
  SUPPORT_EMAIL: z.string().email().default('support@usmanalii.com')
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === 'production') {
  if (!parsedEnv.CORS_ORIGIN.split(',').every((origin) => origin.trim().startsWith('https://'))) {
    throw new Error('CORS_ORIGIN must contain only HTTPS origins in production.');
  }

  if (/replace|dummy|your[-_]?project|example/i.test(parsedEnv.SUPABASE_URL + parsedEnv.SUPABASE_SERVICE_ROLE_KEY + parsedEnv.JWT_SECRET)) {
    throw new Error('Production secrets contain placeholder values.');
  }
}

export const env = parsedEnv;
