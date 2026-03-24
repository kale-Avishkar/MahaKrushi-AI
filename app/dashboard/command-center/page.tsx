'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getUser } from '@/lib/api';

import apiFetch from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

// ── Severity color helper ──────────────────────────────────────
const sevColor: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
};

const sevBg: Record<string, string> = {
  critical: 'rgba(239,68,68,0.12)',
  high: 'rgba(249,115,22,0.1)',
  medium: 'rgba(245,158,11,0.08)',
  low: 'rgba(34,197,94,0.08)',
};

// ── Radial Health Score ────────────────────────────────────────
function HealthGauge({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
        <circle
          cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{ marginTop: '-100px', textAlign: 'center', zIndex: 1, position: 'relative' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, color }}>{score}</div>
        <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>/ 100</div>
      </div>
      <div style={{ marginTop: '2px', fontSize: '0.75rem', color, fontWeight: 700 }}>
        {score >= 75 ? '✅ Healthy' : score >= 50 ? '⚠️ Fair' : '🔴 At Risk'}
      </div>
    </div>
  );
}

export default function CommandCenterPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runningAgents, setRunningAgents] = useState(false);
  const [agentMsg, setAgentMsg] = useState('');

  const { user: globalUser, loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    if (authLoading) return;
    if (!globalUser) {
      setLoading(false);
      setError('Please log in to view your AI Command Center.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const cc = await apiFetch('/api/agents/command-center');
      setData(cc);
    } catch (e: any) {
      setError('Please log in to view your AI Command Center.');
    }
    setLoading(false);
  }, [globalUser, authLoading]);

  useEffect(() => {
    if (globalUser) setUser(globalUser);
    load();
  }, [globalUser, load]);

  const runAgents = async () => {
    setRunningAgents(true);
    setAgentMsg('');
    try {
      await apiFetch('/api/agents/run');
      setAgentMsg('✅ All agents ran successfully!');
      await load();
    } catch {
      setAgentMsg('❌ Failed to run agents. Make sure you are logged in.');
    }
    setRunningAgents(false);
  };

  const healthScore = data?.farm_health?.score ?? 0;
  const breakdown = data?.farm_health?.breakdown ?? {};
  const actions = data?.today_actions ?? [];
  const risk = data?.risk_summary ?? {};
  const farmer = data?.farmer ?? {};
  const recentActions = data?.recent_agent_actions ?? [];
  const cycles = data?.active_cycles_summary ?? [];

  return (
    <div style={{ maxWidth: '1280px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0fdf4' }}>
            🤖 AI Command Center
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Autonomous Farm OS — {farmer.district || 'Your Farm'} • {farmer.primary_crop || '—'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={runAgents}
            disabled={runningAgents}
            style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', borderRadius: '0.5rem', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', opacity: runningAgents ? 0.6 : 1 }}
          >
            {runningAgents ? '⚙️ Running Agents...' : '▶ Run AI Agents'}
          </button>
          <Link href="/dashboard" style={{ padding: '0.5rem 0.85rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      {agentMsg && (
        <div style={{ padding: '0.6rem 1rem', marginBottom: '1rem', background: agentMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${agentMsg.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '0.5rem', color: agentMsg.startsWith('✅') ? '#22c55e' : '#ef4444', fontSize: '0.82rem' }}>
          {agentMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
          <div>Loading AI Command Center...</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
          <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>
          <Link href="/auth" style={{ padding: '0.6rem 1.5rem', background: '#22c55e', borderRadius: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 700 }}>
            Login / Register
          </Link>
        </div>
      ) : (
        <>
          {/* Row 1: Health + Risk Summary + Cycles */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Farm Health Score */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em' }}>🌿 FARM HEALTH</div>
              <HealthGauge score={healthScore} />
              <div style={{ width: '100%' }}>
                {Object.entries(breakdown).map(([k, v]: any) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                    <span>{k.replace(/_/g, ' ')}</span>
                    <span style={{ color: '#9ca3af', fontWeight: 600 }}>{v}/25</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Summary */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>⚠️ RISK RADAR</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Critical', count: risk.critical_count, color: '#ef4444' },
                  { label: 'High', count: risk.high_count, color: '#f97316' },
                ].map(b => (
                  <div key={b.label} style={{ padding: '0.35rem 0.75rem', background: `${b.color}15`, border: `1px solid ${b.color}30`, borderRadius: '0.4rem', fontSize: '0.78rem', color: b.color, fontWeight: 700 }}>
                    {b.count ?? 0} {b.label}
                  </div>
                ))}
                <div style={{ padding: '0.35rem 0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '0.4rem', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>
                  Score: {risk.overall_score ?? 0}/100
                </div>
              </div>
              {(risk.top_risks ?? []).slice(0, 3).map((r: any, i: number) => (
                <div key={i} style={{ padding: '0.5rem 0.65rem', background: sevBg[r.severity] || 'rgba(255,255,255,0.04)', border: `1px solid ${sevColor[r.severity] || '#374151'}30`, borderRadius: '0.4rem', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#e2e8d0', fontWeight: 600 }}>{r.title}</span>
                    <span style={{ fontSize: '0.65rem', color: sevColor[r.severity] || '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{r.severity}</span>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/risk-radar" style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.72rem', color: '#ef4444', textDecoration: 'none' }}>View full risk analysis →</Link>
            </div>

            {/* Active Cycles */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>🌾 ACTIVE CROP CYCLES ({cycles.length})</div>
              {cycles.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                  No active crop cycles. <Link href="/dashboard/harvest" style={{ color: '#8b5cf6' }}>Add one →</Link>
                </div>
              ) : (
                cycles.map((c: any, i: number) => {
                  const stages = ['sowing','germination','growth','flowering','maturity','harvested'];
                  const stageIdx = stages.indexOf(c.stage || 'sowing');
                  const progress = Math.round(((stageIdx + 1) / stages.length) * 100);
                  return (
                    <div key={i} style={{ marginBottom: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(139,92,246,0.06)', borderRadius: '0.4rem', border: '1px solid rgba(139,92,246,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#e2e8d0', fontWeight: 700 }}>{c.crop}</span>
                        <span style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 600 }}>{c.stage}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.4rem' }}>{c.plot_acres} acres • Sown {c.sowing_date}</div>
                      <div style={{ height: '4px', background: 'rgba(139,92,246,0.2)', borderRadius: '2px' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#8b5cf6', borderRadius: '2px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })
              )}
              <Link href="/dashboard/harvest" style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.72rem', color: '#8b5cf6', textDecoration: 'none' }}>Manage crop cycles →</Link>
            </div>
          </div>

          {/* Row 2: Today's Actions + Agent Audit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem' }}>
            {/* Today's Action Plan */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>⚡ TODAY'S AGENT ACTION PLAN</div>
              {actions.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '0.82rem', padding: '1rem', textAlign: 'center' }}>
                  No actions generated. <button onClick={runAgents} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>Run agents</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {actions.map((a: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: sevBg[a.severity] || 'rgba(255,255,255,0.03)', border: `1px solid ${sevColor[a.severity] || '#374151'}25`, borderRadius: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#e2e8d0' }}>{a.action_en}</div>
                        <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '0.2rem' }}>{a.category} • priority {a.priority}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.65rem', color: sevColor[a.severity] || '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{a.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick navigation row */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {[
                  { href: '/dashboard/profit-simulator', label: '💰 Profit Sim', color: '#f59e0b' },
                  { href: '/dashboard/harvest', label: '🌾 Harvest Intel', color: '#8b5cf6' },
                  { href: '/dashboard/buyer-match', label: '🤝 Buyers', color: '#06b6d4' },
                  { href: '/dashboard/farm-health', label: '🌿 Farm Health', color: '#22c55e' },
                ].map(n => (
                  <Link key={n.href} href={n.href} style={{ padding: '0.4rem 0.85rem', background: `${n.color}10`, border: `1px solid ${n.color}25`, borderRadius: '0.4rem', color: n.color, textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                    {n.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Agent Audit Feed */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>📜 RECENT AGENT ACTIONS</div>
              {recentActions.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>No agent actions yet. Run agents to start.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recentActions.map((a: any, i: number) => (
                    <div key={i} style={{ padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>{a.agent}</span>
                        <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{a.at ? new Date(a.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{a.summary || a.action}</div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/dashboard" style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.72rem', color: '#6b7280', textDecoration: 'none' }}>← Back to Dashboard</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
