import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[MahaKrushi] Missing Supabase environment variables.\n' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n' +
    'Get them from: Supabase Dashboard → Project Settings → API'
  );
}

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);
