import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * The Supabase client for live mode. URL + publishable key come from env
 * (see .env.example). The publishable key is safe in the client bundle;
 * row-level security protects the data.
 */
export function createSupabaseClient(): SupabaseClient<Database> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are required for live mode');
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}
