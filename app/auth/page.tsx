'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/services/auth';
import type { SignUpOptions } from '@/services/auth';

// ─── Role Config ───────────────────────────────────────────────────────────────

type Role = SignUpOptions['role'];

const ROLES: { value: Role; icon: string; label: string; label_mr: string }[] = [
  { value: 'farmer',           icon: '👨‍🌾', label: 'Farmer',         label_mr: 'शेतकरी'     },
  { value: 'equipment_owner',  icon: '🚜', label: 'Equipment Owner', label_mr: 'यंत्र मालक' },
  { value: 'storage_owner',    icon: '❄️', label: 'Storage Owner',   label_mr: 'साठवण मालक' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [role, setRole]       = useState<Role>('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState(''); // non-error informational message

  const [form, setForm] = useState({
    email:     '',
    password:  '',
    full_name: '',
  });

  const update = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!form.email.trim())    return 'Email address is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.';
    if (!form.password)        return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'register' && !form.full_name.trim()) return 'Full name is required.';
    return null;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setInfo('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: authError } = await signIn(form.email.trim(), form.password);
        if (authError) { setError(authError.message); return; }
        router.push('/dashboard');

      } else {
        const { error: authError } = await signUp({
          email:            form.email.trim(),
          password:         form.password,
          fullName:         form.full_name.trim(),
          role,
          preferredLanguage: 'mr',
        });

        if (authError) {
          // "Almost there" means email confirmation required — show as info, not error
          if (authError.message.startsWith('Almost there')) {
            setInfo(authError.message);
          } else {
            setError(authError.message);
          }
          return;
        }
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared Styles ──────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    padding: '0.75rem 0.9rem',
    width: '100%',
    borderRadius: '0.5rem',
    outline: 'none',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: '#9ca3af',
    display: 'block',
    marginBottom: '0.35rem',
    fontWeight: 500,
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 20%, #0d260d 0%, #0a0f0a 60%), radial-gradient(ellipse at 80% 80%, #1a2f0a 0%, transparent 50%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌾</div>
          <div style={{
            fontSize: '1.7rem', fontWeight: 900,
            background: 'linear-gradient(135deg,#22c55e,#f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MahaKrushi AI</div>
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            महाराष्ट्र स्मार्ट शेती प्लॅटफॉर्म
          </div>
        </div>

        {/* ── Card ── */}
        <div style={{
          background: 'rgba(13,26,14,0.95)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '1rem', padding: '2rem', backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>

          {/* ── Tab Toggle ── */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.05)',
            borderRadius: '0.5rem', padding: '0.25rem', marginBottom: '1.75rem',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setInfo(''); }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', borderRadius: '0.4rem',
                  background: mode === m ? '#22c55e' : 'transparent',
                  color: mode === m ? 'white' : '#9ca3af',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem',
                }}
              >
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ── Register-only fields ── */}
            {mode === 'register' && (
              <>
                {/* Role selector */}
                <div>
                  <label style={labelStyle}>Account Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        style={{
                          padding: '0.6rem 0.2rem', borderRadius: '0.5rem',
                          border: `1px solid ${role === r.value ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          background: role === r.value ? 'rgba(34,197,94,0.12)' : 'transparent',
                          color: role === r.value ? '#22c55e' : '#9ca3af',
                          cursor: 'pointer', fontSize: '0.7rem', transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{r.icon}</div>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    value={form.full_name}
                    onChange={update('full_name')}
                    placeholder="Ramesh Patil"
                    autoComplete="name"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {/* ── Email ── */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                value={form.email}
                onChange={update('email')}
                type="email"
                placeholder="ramesh@example.com"
                autoComplete={mode === 'login' ? 'email' : 'email'}
                style={inputStyle}
              />
            </div>

            {/* ── Password ── */}
            <div>
              <label style={labelStyle}>
                Password{mode === 'register' && <span style={{ color: '#6b7280', fontWeight: 400 }}> (min. 6 characters)</span>}
              </label>
              <input
                value={form.password}
                onChange={update('password')}
                type="password"
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={inputStyle}
              />
            </div>
          </div>

          {/* ── Error Message ── */}
          {error && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 0.9rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem', color: '#ef4444', fontSize: '0.85rem', lineHeight: 1.4,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Info Message (e.g., email confirmation required) ── */}
          {info && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 0.9rem',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '0.5rem', color: '#60a5fa', fontSize: '0.85rem', lineHeight: 1.4,
            }}>
              📧 {info}
            </div>
          )}

          {/* ── Submit Button ── */}
          <button
            disabled={loading}
            onClick={handleSubmit}
            style={{
              width: '100%', marginTop: '1.5rem', padding: '0.9rem',
              background: loading ? '#374151' : 'linear-gradient(135deg,#16a34a,#15803d)',
              border: 'none', borderRadius: '0.75rem', color: 'white',
              fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(22,163,74,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                Please wait…
              </>
            ) : mode === 'login' ? '🔑 Login' : '✅ Create Account'}
          </button>

        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ color: '#4b5563', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { border-color: rgba(34,197,94,0.5) !important; }
        input::placeholder { color: #4b5563; }
      `}</style>
    </div>
  );
}
