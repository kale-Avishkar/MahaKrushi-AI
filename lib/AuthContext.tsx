'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from '@/services/auth';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string | number;
  full_name: string;
  role: string;
  mobile?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage for user session
    const storedUser = localStorage.getItem('mk_user');
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('mk_user');
        localStorage.removeItem('mk_access_token');
        localStorage.removeItem('mk_refresh_token');
      }
    }
    
    setLoading(false);
  }, [pathname]);

  // Client-side route protection
  useEffect(() => {
    if (loading) return;
    
    const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/owner');
    const isAuthPage = pathname?.startsWith('/auth');

    if (!user && isDashboard) {
      router.push('/auth');
    }

    if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut();
    setUser(null);
    router.push('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = () => useContext(AuthContext);
