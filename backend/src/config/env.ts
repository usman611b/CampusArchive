import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config(); // Fallback to root .env

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  SUPABASE_URL: z.string().url().default('https://xyz.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key'),
  JWT_SECRET: z.string().min(16).default('super_secret_campusarchive_jwt_key_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  FIRST_ADMIN_EMAIL: z.string().email().optional().or(z.literal(''))
});

export const env = envSchema.parse(process.env);
