'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import apiFetch from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

const SEV_COLOR: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
const SEV_BG: Record<string, string> = { critical: 'rgba(239,68,68,0.1)', high: 'rgba(249,115,22,0.08)', medium: 'rgba(245,158,11,0.08)', low: 'rgba(34,197,94,0.08)' };
const TYPE_ICONS: Record<string, string> = { pest: '🐛', disease: '🦠', weather: '🌩️', market: '📉', flood: '🌊' };
const RISK_TYPE_COLORS: Record<string, string> = { pest: '#f97316', disease: '#ef4444', weather: '#3b82f6', market: '#f59e0b', flood: '#06b6d4' };

export default function RiskRadarPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { user, loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Please log in to view your risk radar.');
      return;
    }

    setLoading(true); setError('');
    try {
      const result = await apiFetch('/api/agents/risk-radar');
      setData(result);
    } catch {
      setError('Please log in to view your risk radar.');
    }
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => { load(); }, [load]);

  const allRisks = data?.risks ?? [];
  const tabs = ['all', 'pest', 'disease', 'weather', 'market'];
  const filteredRisks = activeTab === 'all' ? allRisks : allRisks.filter((r: any) => r.risk_type === activeTab);
  const overallScore = data?.overall_risk_score ?? 0;
  const overallColor = overallScore <= 20 ? '#22c55e' : overallScore <= 50 ? '#f59e0b' : '#ef4444';
  const overallLabel = overallScore <= 20 ? 'Low Risk' : overallScore <= 50 ? 'Moderate Risk' : 'High Risk';

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0fdf4' }}>⚠️ Hyperlocal Risk Radar</h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            AI monitors pest, disease, weather, and market risks for your farm in real-time
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.5rem', color: '#ef4444', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>🔄 Refresh</button>
          <Link href="/dashboard/command-center" style={{ padding: '0.5rem 0.85rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Command Center</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div><div>Scanning risk signals...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '0.75rem' }}>{error}</div>
          <Link href="/auth" style={{ padding: '0.6rem 1.5rem', background: '#22c55e', borderRadius: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
        </div>
      ) : (
        <>
          {/* Overall risk scores bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="card" style={{ padding: '1rem', border: `1px solid ${overallColor}30`, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: overallColor }}>{overallScore}</div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>Overall Risk Score</div>
              <div style={{ fontSize: '0.75rem', color: overallColor, fontWeight: 700, marginTop: '0.2rem' }}>{overallLabel}</div>
            </div>
            {[
              { type: 'critical', count: data?.critical_count, label: 'Critical', color: '#ef4444' },
              { type: 'high', count: data?.high_count, label: 'High', color: '#f97316' },
              { type: 'medium', count: data?.medium_count, label: 'Medium', color: '#f59e0b' },
              { type: 'low', count: data?.low_count, label: 'Low Risk', color: '#22c55e' },
            ].map(b => (
              <div key={b.type} className="card" style={{ padding: '1rem', border: `1px solid ${b.color}20`, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: b.color }}>{b.count ?? 0}</div>
                <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>{b.label} Alerts</div>
              </div>
            ))}
          </div>

          {/* District info */}
          <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#9ca3af', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>📍 District: <strong style={{ color: '#e2e8d0' }}>{data?.district}</strong></span>
            <span>⏱️ Analysed: <strong style={{ color: '#e2e8d0' }}>{data?.generated_at ? new Date(data.generated_at).toLocaleTimeString('en-IN') : 'Just now'}</strong></span>
            <span>🔍 Total risks: <strong style={{ color: '#e2e8d0' }}>{data?.total_risks ?? 0}</strong></span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '0.4rem 0.9rem', background: activeTab === t ? `${RISK_TYPE_COLORS[t] || '#22c55e'}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${activeTab === t ? `${RISK_TYPE_COLORS[t] || '#22c55e'}40` : 'rgba(255,255,255,0.08)'}`, borderRadius: '0.4rem', color: activeTab === t ? (RISK_TYPE_COLORS[t] || '#22c55e') : '#6b7280', cursor: 'pointer', fontSize: '0.78rem', fontWeight: activeTab === t ? 700 : 500 }}>
                {TYPE_ICONS[t] || '🔍'} {t.charAt(0).toUpperCase() + t.slice(1)}
                <span style={{ marginLeft: '0.35rem', fontSize: '0.65rem', opacity: 0.8 }}>
                  ({t === 'all' ? allRisks.length : allRisks.filter((r: any) => r.risk_type === t).length})
                </span>
              </button>
            ))}
          </div>

          {/* Risk Cards */}
          {filteredRisks.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#22c55e' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontWeight: 700 }}>No {activeTab === 'all' ? '' : activeTab} risks detected</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.25rem' }}>Current conditions pose no significant {activeTab} threat to your crops.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '0.75rem' }}>
              {filteredRisks.map((r: any, i: number) => (
                <div key={i} style={{ padding: '1.1rem 1.25rem', background: SEV_BG[r.severity] || 'rgba(255,255,255,0.03)', border: `1px solid ${SEV_COLOR[r.severity] || '#374151'}30`, borderRadius: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{TYPE_ICONS[r.risk_type] || '⚠️'}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0fdf4' }}>{r.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '0.1rem', textTransform: 'capitalize' }}>
                          {r.risk_type} risk • affects: {Array.isArray(r.affected_crops) ? r.affected_crops.join(', ') : r.crop}
                        </div>
                      </div>
                    </div>
                    <span style={{ padding: '0.18rem 0.55rem', background: `${SEV_COLOR[r.severity]}20`, borderRadius: '0.3rem', fontSize: '0.65rem', color: SEV_COLOR[r.severity], fontWeight: 800, textTransform: 'uppercase', flexShrink: 0 }}>
                      {r.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.6rem', lineHeight: 1.5 }}>{r.description_en}</div>
                  {Array.isArray(r.recommended_actions) && r.recommended_actions.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.3rem' }}>RECOMMENDED ACTIONS</div>
                      {r.recommended_actions.map((action: string, ai: number) => (
                        <div key={ai} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                          <span style={{ color: SEV_COLOR[r.severity], fontSize: '0.68rem', flexShrink: 0, marginTop: '1px' }}>→</span>
                          <span style={{ fontSize: '0.72rem', color: '#e2e8d0' }}>{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
