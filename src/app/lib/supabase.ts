import { createClient } from '@supabase/supabase-js';
import { API_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export { API_URL };
