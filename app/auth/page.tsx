'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, setTokens, setUser } from '@/lib/api';

type AuthStep = 'contact' | 'otp' | 'register';
type Role = 'farmer' | 'equipment_owner' | 'storage_owner';

const ROLES = [
  { value: 'farmer', icon: '👨‍🌾', label: 'Farmer', label_mr: 'शेतकरी' },
  { value: 'equipment_owner', icon: '🚜', label: 'Equipment Owner', label_mr: 'यंत्र मालक' },
  { value: 'storage_owner', icon: '❄️', label: 'Storage Owner', label_mr: 'साठवण मालक' },
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<Role>('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    mobile: '', full_name: '', email: '', password: ''
  });

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.mobile || !form.password) return setError("Please fill required fields");
    if (mode === 'register' && !form.full_name) return setError("Full name is required");
    
    setLoading(true); setError('');
    try {
      let data;
      if (mode === 'login') {
        data = await authApi.login(form.mobile, form.password);
      } else {
        data = await authApi.register({
          full_name: form.full_name, mobile: form.mobile, email: form.email,
          password: form.password, role, preferred_language: 'mr'
        });
      }
      setTokens(data.access_token, data.refresh_token);
      setUser({ id: data.user_id, role: data.role, full_name: data.full_name });
      router.push('/dashboard');
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 20%, #0d260d 0%, #0a0f0a 60%), radial-gradient(ellipse at 80% 80%, #1a2f0a 0%, transparent 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌾</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, background: 'linear-gradient(135deg,#22c55e,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MahaKrushi AI</div>
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>महाराष्ट्र स्मार्ट शेती प्लॅटफॉर्म</div>
        </div>

        <div style={{ background: 'rgba(13,26,14,0.95)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '1rem', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0.25rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setMode('login')} style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '0.4rem', background: mode === 'login' ? '#22c55e' : 'transparent', color: mode === 'login' ? 'white' : '#9ca3af', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>Login</button>
            <button onClick={() => setMode('register')} style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '0.4rem', background: mode === 'register' ? '#22c55e' : 'transparent', color: mode === 'register' ? 'white' : '#9ca3af', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>Register</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.4rem' }}>Account Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                    {ROLES.map(r => (
                      <button key={r.value} onClick={() => setRole(r.value as Role)} style={{ padding: '0.6rem 0.2rem', borderRadius: '0.5rem', border: `1px solid ${role === r.value ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.1)'}`, background: role === r.value ? 'rgba(34,197,94,0.12)' : 'transparent', color: role === r.value ? '#22c55e' : '#9ca3af', cursor: 'pointer', fontSize: '0.7rem', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{r.icon}</div>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
                  <input value={form.full_name} onChange={update('full_name')} placeholder="Ramesh Patil" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', width: '100%', borderRadius: '0.5rem', outline: 'none' }} />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'block', marginBottom: '0.4rem' }}>Mobile Number</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0 0.75rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem', marginRight: '0.5rem' }}>+91</span>
                <input value={form.mobile} onChange={update('mobile')} type="tel" placeholder="9823000000" style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.75rem 0', width: '100%', outline: 'none', height: '40px' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.3rem' }}>Password</label>
              <input value={form.password} onChange={update('password')} type="password" placeholder="••••••••" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', width: '100%', borderRadius: '0.5rem', outline: 'none' }} />
            </div>
          </div>

          {error && <div style={{ marginTop: '1rem', padding: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', color: '#ef4444', fontSize: '0.85rem' }}>⚠️ {error}</div>}

          <button
            disabled={loading}
            onClick={handleSubmit}
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem', background: loading ? '#374151' : 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)' }}>
            {loading ? '⏳ Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ color: '#4b5563', fontSize: '0.8rem', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
