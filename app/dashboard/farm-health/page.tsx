'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import apiFetch from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

function HealthGaugeLarge({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const r = 80;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={200} height={200} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={100} cy={100} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={18} />
        <circle cx={100} cy={100} r={r} fill="none" stroke={color} strokeWidth={18}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.5s ease, stroke 0.5s ease' }} />
        {/* Glow effect */}
        <circle cx={100} cy={100} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} opacity={0.3} strokeLinecap="round" />
      </svg>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginTop: '5px' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color, lineHeight: 1, transition: 'color 0.5s', marginBottom: '0.1rem' }}>{score}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>out of 100</div>
        <div style={{ fontSize: '0.85rem', color, fontWeight: 800, marginTop: '0.2rem' }}>
          {score >= 75 ? '✅ Excellent' : score >= 50 ? '⚠️ Fair' : '🔴 At Risk'}
        </div>
      </div>
    </div>
  );
}

const BREAKDOWN_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  weather_fitness: { label: 'Weather Fitness', icon: '🌤️', color: '#3b82f6' },
  disease_risk_inverse: { label: 'Disease Safety', icon: '🦠', color: '#ef4444' },
  crop_cycle_health: { label: 'Crop Cycle Health', icon: '🌾', color: '#22c55e' },
  market_timing: { label: 'Market Timing', icon: '📊', color: '#f59e0b' },
};

export default function FarmHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Please log in to view your Farm Health Score.');
      return;
    }

    setLoading(true); setError('');
    try {
      const result = await apiFetch('/api/agents/farm-health');
      setData(result);
    } catch {
      setError('Please log in to view your Farm Health Score.');
    }
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => { load(); }, [load]);

  const score = data?.farm_health_score ?? 0;
  const breakdown = data?.farm_health_breakdown ?? {};
  const actions = data?.actions ?? [];
  const weather = data?.weather_summary ?? {};

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0fdf4' }}>🌿 Farm Health Score</h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            AI computes a holistic 0–100 score from weather, crops, disease risk, and market timing
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.5rem', color: '#22c55e', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>🔄 Refresh</button>
          <Link href="/dashboard/command-center" style={{ padding: '0.5rem 0.85rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Command Center</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div><div>Computing farm health...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '0.75rem' }}>{error}</div>
          <Link href="/auth" style={{ padding: '0.6rem 1.5rem', background: '#22c55e', borderRadius: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
        </div>
      ) : (
        <>
          {/* Main score + breakdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1rem' }}>
            <div className="card" style={{ flex: '1 1 320px', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em' }}>🌿 OVERALL HEALTH</div>
              <HealthGaugeLarge score={score} />
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.5, marginTop: '0.5rem' }}>
                {data?.explanation_en}
              </div>
            </div>

            <div className="card" style={{ flex: '2.5 1 300px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>📊 SCORE BREAKDOWN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(breakdown).map(([key, val]: any) => {
                  const meta = BREAKDOWN_LABELS[key] || { label: key, icon: '📌', color: '#9ca3af' };
                  const maxVal = 25;
                  const pct = Math.round((val / maxVal) * 100);
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#e2e8d0', fontWeight: 600 }}>{meta.icon} {meta.label}</span>
                        <span style={{ fontSize: '0.8rem', color: meta.color, fontWeight: 800 }}>{val} / {maxVal}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: '4px', transition: 'width 1.2s ease', opacity: 0.85 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weather signals */}
          {Object.keys(weather).length > 0 && (
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.5rem' }}>🌤️ WEATHER SIGNALS USED</div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#9ca3af' }}>
                <span>🌡️ <strong style={{ color: '#f0fdf4' }}>{weather.temp}°C</strong></span>
                <span>💧 <strong style={{ color: '#f0fdf4' }}>{weather.humidity}%</strong> humidity</span>
                <span>🌧️ <strong style={{ color: '#f0fdf4' }}>{weather.rain}mm</strong> rainfall</span>
                <span>💨 <strong style={{ color: '#f0fdf4' }}>{weather.wind} km/h</strong> wind</span>
                <span>🌦️ Tomorrow: <strong style={{ color: '#f0fdf4' }}>{weather.rain_tomorrow}mm</strong></span>
              </div>
            </div>
          )}

          {/* Recommended actions */}
          {actions.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                ⚡ ACTIONS TO IMPROVE YOUR HEALTH SCORE ({actions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {actions.map((a: any, i: number) => {
                  const sevColor: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
                  const color = sevColor[a.severity] || '#9ca3af';
                  return (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.45rem', border: `1px solid ${color}18`, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#e2e8d0' }}>{a.action_en}</div>
                        <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.15rem' }}>{a.category}</div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0, marginTop: '2px' }}>{a.severity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation row */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard/risk-radar" style={{ padding: '0.4rem 0.85rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.4rem', color: '#ef4444', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>⚠️ Risk Radar</Link>
            <Link href="/dashboard/harvest" style={{ padding: '0.4rem 0.85rem', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '0.4rem', color: '#8b5cf6', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>🌾 Harvest Intel</Link>
            <Link href="/dashboard/profit-simulator" style={{ padding: '0.4rem 0.85rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.4rem', color: '#f59e0b', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>💰 Profit Simulator</Link>
          </div>
        </>
      )}
    </div>
  );
}
