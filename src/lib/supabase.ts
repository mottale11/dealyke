import { createClient } from '@supabase/supabase-js';

const isBrowser = typeof window !== 'undefined';

const supabaseUrl = isBrowser 
  ? (import.meta.env.VITE_SUPABASE_URL || '') 
  : (process.env.SUPABASE_URL || '');

const supabaseAnonKey = isBrowser 
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '') 
  : (process.env.SUPABASE_ANON_KEY || '');

const supabaseServiceRoleKey = !isBrowser 
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY || '') 
  : '';

// Client for general use (honors RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend tasks (bypasses RLS) - Only available on server
export const getSupabaseAdmin = () => {
  if (isBrowser) return null;
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export const supabaseAdmin = isBrowser ? null : getSupabaseAdmin();
