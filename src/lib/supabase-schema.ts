import { supabase, isSupabaseConfigured } from '@/lib/supabase';

let ready: Promise<boolean> | null = null;

/**
 * Detect the course schema at runtime. Requiring an environment toggle made
 * an already configured and migrated project quietly fall back to the local
 * six-course sample catalog.
 */
export function supabaseTablesReady() {
  if (!isSupabaseConfigured) {
    return Promise.resolve(false);
  }
  if (!ready) {
    ready = Promise.resolve(
      supabase.from('courses').select('id').limit(1).then(({ error }) => {
        if (!error) return true;
        return error.code !== 'PGRST205' && !/schema cache/i.test(error.message ?? '');
      }),
    );
  }
  return ready;
}
