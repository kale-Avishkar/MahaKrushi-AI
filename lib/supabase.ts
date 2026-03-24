/**
 * MahaKrushi AI – Supabase Browser Client (singleton)
 *
 * Import `supabase` from this file anywhere in client components.
 * Never import from utils/supabase/client directly inside app/ code.
 */
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[MahaKrushi] Missing Supabase env vars.\n' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
  // Reject service-role / secret keys — these must NEVER go in frontend code
  if (supabaseAnonKey.startsWith('sb_secret_')) {
    throw new Error(
      '[MahaKrushi] ❌ SECURITY ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is a SERVICE ROLE (secret) key.\n' +
      'This key grants full database admin access and must NEVER be used in frontend code.\n' +
      'Use the ANON / PUBLIC key instead (starts with "sb_publishable_" or "eyJ").\n' +
      'Find it at: Supabase Dashboard → Settings → API → "anon" key.'
    );
  }
  const isValidFormat = supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_publishable_');
  if (!isValidFormat) {
    console.warn(
      '[MahaKrushi] NEXT_PUBLIC_SUPABASE_ANON_KEY format looks unexpected.\n' +
      'It should start with "sb_publishable_" (new format) or "eyJ" (old format).\n' +
      'Get it from: Supabase Dashboard → Settings → API → "anon" key.'
    );
  }
}

/**
 * Singleton Supabase browser client.
 * Safe to import in any Client Component.
 */
export const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
