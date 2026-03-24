'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import apiFetch from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function BuyerMatchPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crop, setCrop] = useState('');
  const [qty, setQty] = useState('10');
  const [contacted, setContacted] = useState<number[]>([]);

  const { user, loading: authLoading } = useAuth();

  const load = useCallback(async (c?: string, q?: string) => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Please log in to access buyer matching.');
      return;
    }

    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (c) params.set('crop', c);
      if (q) params.set('qty_qtl', q);
      const result = await apiFetch(`/api/agents/buyer-match?${params}`);
      setData(result);
    } catch {
      setError('Please log in to access buyer matching.');
    }
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => { load(crop, qty); }, [load]);

  const buyers = data?.top_buyers ?? [];
  const CROPS = ['Onion','Cotton','Soybean','Tomato','Grapes','Pomegranate','Wheat','Jowar','Maize','Tur','Banana','Sugarcane','Gram','Orange'];

  const contact = (id: number) => {
    setContacted(prev => [...prev, id]);
  };

  const starRating = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0fdf4' }}>🤝 AI Buyer Matching</h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            AI ranks registered buyers for your produce by crop match, price, rating, and distance
          </p>
        </div>
        <Link href="/dashboard/command-center" style={{ padding: '0.5rem 0.85rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Command Center</Link>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Crop</label>
          <select value={crop} onChange={e => setCrop(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', color: '#e2e8d0', fontSize: '0.82rem', minWidth: '130px' }}>
            <option value="">Auto (profile crop)</option>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Quantity (qtl)</label>
          <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="1"
            style={{ padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', color: '#e2e8d0', fontSize: '0.82rem', width: '100px' }} />
        </div>
        <button onClick={() => load(crop, qty)}
          style={{ padding: '0.45rem 1.25rem', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', border: 'none', borderRadius: '0.4rem', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
          🔍 Find Buyers
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div><div>Finding best buyers...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '0.75rem' }}>{error}</div>
          <Link href="/auth" style={{ padding: '0.6rem 1.5rem', background: '#22c55e', borderRadius: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          {data && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                🌾 <strong style={{ color: '#f0fdf4' }}>{data.crop}</strong> •
                📦 <strong style={{ color: '#f0fdf4' }}>{data.qty_qtl} qtl</strong> •
                📊 Mandi price: <strong style={{ color: '#f59e0b' }}>₹{data.current_mandi_price}/qtl</strong> •
                🤝 <strong style={{ color: '#06b6d4' }}>{data.total_buyers_found}</strong> buyers found
              </div>
            </div>
          )}

          {buyers.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😔</div>
              <div>No buyers registered yet. The platform is growing — check back soon.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {buyers.map((b: any, i: number) => {
                const isContacted = contacted.includes(b.id);
                const rankColor = i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#374151';
                return (
                  <div key={b.id} style={{ padding: '1.1rem 1.25rem', background: i === 0 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '0.65rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Rank badge */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${rankColor}20`, border: `2px solid ${rankColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: rankColor }}>#{i + 1}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <div>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f0fdf4' }}>{b.business_name || b.name}</span>
                          {b.is_verified && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '0.1rem 0.4rem', borderRadius: '0.3rem', fontWeight: 700 }}>✅ VERIFIED</span>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22c55e' }}>₹{b.offered_price_per_qtl}/qtl</div>
                          <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Deal value: ₹{b.estimated_deal_value?.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span>📍 {b.district}</span>
                        <span style={{ color: '#f59e0b' }}>{starRating(b.rating || 4)} {b.rating}</span>
                        <span>📦 {b.min_qty_qtl}–{b.max_qty_qtl} qtl</span>
                        <span>🌾 Grade: {b.quality_preference}</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#9ca3af', lineHeight: 1.4, marginBottom: '0.5rem' }}>{b.explanation_en}</div>
                      {b.crop_preferences?.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {b.crop_preferences.map((cp: string) => (
                            <span key={cp} style={{ padding: '0.1rem 0.4rem', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '0.3rem', fontSize: '0.65rem', color: '#06b6d4' }}>{cp}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                      <div style={{ padding: '0.25rem 0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Match Score</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#06b6d4' }}>{b.match_score}</div>
                      </div>
                      {b.phone && (
                        <button onClick={() => contact(b.id)}
                          disabled={isContacted}
                          style={{ padding: '0.4rem 0.85rem', background: isContacted ? 'rgba(34,197,94,0.1)' : 'linear-gradient(135deg,#06b6d4,#0891b2)', border: isContacted ? '1px solid rgba(34,197,94,0.3)' : 'none', borderRadius: '0.4rem', color: isContacted ? '#22c55e' : 'white', fontSize: '0.72rem', fontWeight: 700, cursor: isContacted ? 'default' : 'pointer' }}>
                          {isContacted ? '✅ Contacted' : '📞 Contact'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {data && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              💡 {data.explanation_en}
            </div>
          )}
        </>
      )}
    </div>
  );
}
