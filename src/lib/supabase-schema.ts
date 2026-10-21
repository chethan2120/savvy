import { supabase, isSupabaseConfigured } from '@/lib/supabase';

let ready: Promise<boolean> | null = null;

/**
 * The live course records are the institute programs, not public.courses.
 * Probing that missing table produced GET /rest/v1/courses?select=id&limit=1 → 404.
 * Set NEXT_PUBLIC_SUPABASE_SCHEMA_READY=true only after the SQL migrations are applied.
 */
export function supabaseTablesReady() {
  if (!isSupabaseConfigured || process.env.NEXT_PUBLIC_SUPABASE_SCHEMA_READY !== 'true') {
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
