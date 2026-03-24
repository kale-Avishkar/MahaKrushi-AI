/**
 * MahaKrushi AI – Auth Service
 *
 * All Supabase auth operations go through here.
 * Returns { data, error } with user-friendly error messages.
 */
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthError {
  message: string;          // user-facing message
  devMessage?: string;      // raw error (only log in dev)
}

export interface SignUpOptions {
  email: string;
  password: string;
  fullName: string;
  role: 'farmer' | 'equipment_owner' | 'storage_owner';
  preferredLanguage?: string;
}

// ─── Error translator ─────────────────────────────────────────────────────────

function toUserMessage(raw: string | undefined): string {
  if (!raw) return 'An unexpected error occurred. Please try again.';
  const r = raw.toLowerCase();

  if (r.includes('invalid login credentials') || r.includes('invalid email or password'))
    return 'Incorrect email or password. Please try again.';
  if (r.includes('email not confirmed'))
    return 'Please confirm your email before logging in. Check your inbox.';
  if (r.includes('user already registered') || r.includes('already been registered'))
    return 'This email is already registered. Please log in instead.';
  if (r.includes('password should be at least') || r.includes('weak password'))
    return 'Password is too weak. Use at least 6 characters.';
  if (r.includes('signup is disabled') || r.includes('signups not allowed'))
    return 'New registrations are currently disabled. Please contact support.';
  if (r.includes('network') || r.includes('fetch') || r.includes('failed to fetch'))
    return 'Network error. Check your internet connection and try again.';
  if (r.includes('rate limit'))
    return 'Too many attempts. Please wait a minute and try again.';
  if (r.includes('email address') && r.includes('invalid'))
    return 'Please enter a valid email address.';

  return raw; // fallback to raw if nothing matched
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[MahaKrushi Auth] signIn error:', error.message);
    }
    return { data: null, error: { message: toUserMessage(error.message), devMessage: error.message } as AuthError };
  }

  return { data, error: null };
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp({ email, password, fullName, role, preferredLanguage = 'mr' }: SignUpOptions) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        preferred_language: preferredLanguage,
      },
    },
  });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[MahaKrushi Auth] signUp error:', error.message);
    }
    return { data: null, error: { message: toUserMessage(error.message), devMessage: error.message } as AuthError };
  }

  // Supabase returns a user with no session when email confirmation is required
  if (data.user && !data.session) {
    return {
      data,
      error: {
        message: 'Almost there! Check your email inbox to confirm your account, then log in.',
      } as AuthError,
    };
  }

  return { data, error: null };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error && process.env.NODE_ENV === 'development') {
    console.error('[MahaKrushi Auth] signOut error:', error.message);
  }
  return { error };
}
