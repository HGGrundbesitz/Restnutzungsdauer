import {createClient} from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawSupabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
    rawSupabasePublishableKey &&
    !rawSupabaseUrl.includes('placeholder') &&
    !rawSupabasePublishableKey.includes('placeholder')
);

const supabaseUrl = isSupabaseConfigured ? rawSupabaseUrl : 'https://placeholder.supabase.co';
const supabasePublishableKey = isSupabaseConfigured ? rawSupabasePublishableKey : 'placeholder-key';

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn('Supabase URL or publishable key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl!, supabasePublishableKey!);
