'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import apiFetch from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

const SCENARIO_ICONS: Record<string, string> = {
  sell_now: '⚡',
  store_15d: '📦',
  store_30d: '🧊',
  other_mandi: '🚛',
  direct_buyer: '🤝',
};

const SCENARIO_COLORS: Record<string, string> = {
  sell_now: '#f59e0b',
  store_15d: '#3b82f6',
  store_30d: '#8b5cf6',
  other_mandi: '#f97316',
  direct_buyer: '#22c55e',
};

function formatINR(n: number): string {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function ProfitSimulatorPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const { user, loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Please log in and add a crop cycle first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await apiFetch('/api/agents/profit-engine');
      setData(result);
      // Auto-select first cycle
      const cycleIds = Object.keys(result.scenarios_by_cycle || {});
      if (cycleIds.length > 0) setSelectedCycleId(Number(cycleIds[0]));
    } catch {
      setError('Please log in and add a crop cycle first.');
    }
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => { load(); }, [load]);

  const allCycleIds = data ? Object.keys(data.scenarios_by_cycle || {}).map(Number) : [];
  const currentScenarios: any[] = selectedCycleId != null && data
    ? (data.scenarios_by_cycle[selectedCycleId] || [])
    : [];

  const bestScenario = currentScenarios.find((s: any) => s.is_recommended);
  const maxProfit = Math.max(...currentScenarios.map((s: any) => s.net_profit || 0));

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0fdf4' }}>💰 Profit Simulator</h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            AI compares 5 sell strategies — sell now, store, alternate mandi, or direct buyer
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '0.5rem', color: '#f59e0b', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
            🔄 Refresh
          </button>
          <Link href="/dashboard/command-center" style={{ padding: '0.5rem 0.85rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>
            ← Command Center
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💰</div>
          <div>Computing profit scenarios...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
          <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth" style={{ padding: '0.6rem 1.5rem', background: '#22c55e', borderRadius: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
            <Link href="/dashboard/harvest" style={{ padding: '0.6rem 1.5rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '0.5rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 700 }}>Add Crop Cycle</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Cycle selector */}
          {allCycleIds.length > 1 && (
            <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>SELECT CROP CYCLE</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {allCycleIds.map(id => (
                  <button key={id}
                    onClick={() => setSelectedCycleId(id)}
                    style={{ padding: '0.4rem 0.85rem', background: selectedCycleId === id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedCycleId === id ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '0.4rem', color: selectedCycleId === id ? '#f59e0b' : '#9ca3af', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Cycle #{id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Best option banner */}
          {bestScenario && (
            <div style={{ padding: '1rem 1.25rem', marginBottom: '1rem', background: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(16,163,74,0.08))', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, marginBottom: '0.2rem' }}>⭐ AI RECOMMENDED STRATEGY</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f0fdf4' }}>
                  {SCENARIO_ICONS[bestScenario.scenario_type]} {bestScenario.scenario_label}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>{bestScenario.explanation_en}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22c55e' }}>{formatINR(bestScenario.net_profit)}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>estimated net profit</div>
              </div>
            </div>
          )}

          {/* 5 Scenario Cards */}
          {currentScenarios.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              No scenarios generated. <Link href="/dashboard/harvest" style={{ color: '#8b5cf6' }}>Add a crop cycle first →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
              {currentScenarios.map((s: any, i: number) => {
                const color = SCENARIO_COLORS[s.scenario_type] || '#22c55e';
                const isRec = s.is_recommended;
                const barWidth = maxProfit > 0 ? Math.max(5, (s.net_profit / maxProfit) * 100) : 0;
                return (
                  <div key={i} style={{
                    padding: '1.25rem',
                    background: isRec ? `linear-gradient(135deg,${color}18,${color}08)` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isRec ? `${color}50` : `${color}20`}`,
                    borderRadius: '0.75rem',
                    position: 'relative',
                    transition: 'transform 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  >
                    {isRec && (
                      <div style={{ position: 'absolute', top: '-10px', right: '12px', padding: '0.15rem 0.6rem', background: color, borderRadius: '1rem', fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>
                        ✅ BEST
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '1.2rem' }}>{SCENARIO_ICONS[s.scenario_type]}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0fdf4', marginTop: '0.2rem' }}>{s.scenario_label}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.15rem 0.45rem', borderRadius: '0.3rem', fontWeight: 700 }}>
                          {s.risk_pct}% risk
                        </div>
                      </div>
                    </div>

                    {/* Numbers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {[
                        { label: 'Price/qtl', value: formatINR(s.estimated_price_per_qtl) },
                        { label: 'Qty (qtl)', value: s.estimated_qty_qtl },
                        { label: 'Revenue', value: formatINR(s.estimated_revenue) },
                        { label: 'Cost', value: formatINR(s.estimated_cost) },
                      ].map((kv, j) => (
                        <div key={j} style={{ padding: '0.4rem 0.5rem', background: `${color}08`, borderRadius: '0.3rem' }}>
                          <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>{kv.label}</div>
                          <div style={{ fontSize: '0.82rem', color: '#e2e8d0', fontWeight: 700 }}>{kv.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Net profit bar */}
                    <div style={{ marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Net Profit</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}>{formatINR(s.net_profit)}</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 1s ease' }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
                      {s.explanation_en}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {data && (
            <div className="card" style={{ padding: '1rem 1.25rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>ℹ️ AI ANALYSIS</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{data.explanation_en}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/dashboard/buyer-match" style={{ padding: '0.4rem 0.85rem', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '0.4rem', color: '#06b6d4', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>🤝 Find Buyers</Link>
                <Link href="/dashboard/storage" style={{ padding: '0.4rem 0.85rem', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '0.4rem', color: '#0ea5e9', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>❄️ Book Storage</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
