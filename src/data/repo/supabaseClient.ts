import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/** True when the app is configured to talk to Supabase. */
export const isLiveMode = (import.meta.env.VITE_APP_MODE ?? 'demo') === 'live';

let client: SupabaseClient<Database> | null = null;

/**
 * The shared Supabase client for live mode (auth UI + SupabaseRepository use
 * the same instance, so they share one session). URL + publishable key come
 * from env; the publishable key is safe in the client bundle — RLS protects
 * the data.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are required for live mode');
  }
  client = createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
