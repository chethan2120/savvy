import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// Publishable key. Next.js inlines NEXT_PUBLIC_*; VITE_* is accepted as well
// when next.config maps it, or when this file runs in Node.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

/**
 * True only when real Supabase credentials are present in the environment.
 * Used by forms and the admin portal to avoid claiming a submission was
 * saved (or that a login succeeded) when no backend is actually connected.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder'),
);

// A client is always created so imports stay valid; when unconfigured it
// points at a harmless placeholder origin and callers gate on the flag above.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);
