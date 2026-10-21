import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseTablesReady } from '@/lib/supabase-schema';

export type WebsiteSettings = {
  show_recognitions: boolean;
  institute_name: string;
};

export const defaultWebsiteSettings: WebsiteSettings = {
  show_recognitions: false,
  institute_name: 'Savvy Training Institute',
};

/**
 * The public.website_settings table is part of the unapplied SQL migration.
 * Until NEXT_PUBLIC_SUPABASE_SCHEMA_READY=true, the institute database is the record.
 */
export async function loadWebsiteSettings(): Promise<WebsiteSettings> {
  if (isSupabaseConfigured && (await supabaseTablesReady())) {
    const { data, error } = await supabase
      .from('website_settings')
      .select('show_recognitions, institute_name')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return defaultWebsiteSettings;
    return {
      show_recognitions: data.show_recognitions === true,
      institute_name: data.institute_name || defaultWebsiteSettings.institute_name,
    };
  }
  const response = await fetch('/api/website-settings', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Website settings request failed (${response.status}).`);
  const data = await response.json() as Partial<WebsiteSettings>;
  if (typeof data.show_recognitions !== 'boolean' || typeof data.institute_name !== 'string') {
    throw new Error('Website settings response was not in the expected shape.');
  }
  return {
    show_recognitions: data.show_recognitions,
    institute_name: data.institute_name || defaultWebsiteSettings.institute_name,
  };
}
