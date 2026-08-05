import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabaseClient = createClient(
  env.SUPABASE_URL || 'https://axlwuknoyxfitmbedyay.supabase.co',
  env.SUPABASE_ANON_KEY || ''
);
