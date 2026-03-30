/**
 * MahaKrushi AI – Auth Service
 *
 * Modified to use local FastAPI backend instead of Supabase.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface AuthError {
  message: string;
}

export interface SignUpOptions {
  mobile: string;
  password: string;
  fullName: string;
  role: 'farmer' | 'equipment_owner' | 'storage_owner';
  preferredLanguage?: string;
}

export async function signIn(mobile: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { data: null, error: { message: errData.detail || 'Invalid mobile or password' } };
    }
    
    const data = await res.json();
    // Save token
    const userData = {
      id: data.user_id,
      full_name: data.full_name,
      role: data.role,
      mobile: mobile,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('mk_access_token', data.access_token);
      localStorage.setItem('mk_refresh_token', data.refresh_token);
      localStorage.setItem('mk_user', JSON.stringify(userData));
    }
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: 'Network error. Backend might be unreachable.' } };
  }
}

export async function signUp({ mobile, password, fullName, role, preferredLanguage = 'mr' }: SignUpOptions) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile,
        password,
        full_name: fullName,
        role,
        preferred_language: preferredLanguage
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { data: null, error: { message: errData.detail || 'Registration failed' } };
    }

    const data = await res.json();
    const userData = {
      id: data.user_id,
      full_name: data.full_name,
      role: data.role,
      mobile: mobile,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('mk_access_token', data.access_token);
      localStorage.setItem('mk_refresh_token', data.refresh_token);
      localStorage.setItem('mk_user', JSON.stringify(userData));
    }
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: 'Network error. Backend might be unreachable.' } };
  }
}

export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mk_access_token');
    localStorage.removeItem('mk_refresh_token');
    localStorage.removeItem('mk_user');
  }
  return { error: null };
}
