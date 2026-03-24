'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import apiFetch from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

async function postAgent(path: string, body: any) {
  return apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
}

const STAGES = ['sowing', 'germination', 'growth', 'flowering', 'maturity', 'harvested'];
const STAGE_ICONS: Record<string, string> = {
  sowing: '🌱', germination: '🌿', growth: '🌾', flowering: '🌸', maturity: '🍀', harvested: '✅'
};

const CROPS = ['Onion','Cotton','Soybean','Tomato','Grapes','Pomegranate','Wheat','Jowar','Maize','Tur','Banana','Sugarcane','Gram','Orange'];

export default function HarvestPage() {
  const [intel, setIntel] = useState<any>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const [form, setForm] = useState({ crop: 'Onion', variety: '', plot_acres: '1', sowing_date: '', expected_qty_qtl: '' });

  const { user, loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Please log in to view harvest intelligence.');
      return;
    }

    setLoading(true); setError('');
    try {
      const [h, c] = await Promise.all([apiFetch('/api/agents/harvest-intel'), apiFetch('/api/crop-cycles')]);
      setIntel(h);
      setCycles(c.cycles || []);
    } catch {
      setError('Please log in to view harvest intelligence.');
    }
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => { load(); }, [load]);

  const addCycle = async () => {
    if (!form.sowing_date || !form.crop) { setAddMsg('Please fill crop and sowing date.'); return; }
    setAdding(true); setAddMsg('');
    try {
      await postAgent('/api/crop-cycles', {
        crop: form.crop, variety: form.variety || null,
        plot_acres: parseFloat(form.plot_acres) || 1,
        sowing_date: form.sowing_date,
        expected_qty_qtl: form.expected_qty_qtl ? parseFloat(form.expected_qty_qtl) : null,
      });
      setAddMsg('✅ Crop cycle added!');
      setShowAdd(false);
      setForm({ crop: 'Onion', variety: '', plot_acres: '1', sowing_date: '', expected_qty_qtl: '' });
      await load();
    } catch {
      setAddMsg('❌ Failed to add crop cycle. Make sure you are logged in and have a farmer profile.');
    }
    setAdding(false);
  };

  const forecasts = intel?.forecasts ?? [];
  const mostReady = intel?.most_ready;

  const readinessColor = (score: number) => score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#9ca3af';
  const weatherRiskColor: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f0fdf4' }}>🌾 Harvest Intelligence</h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            AI predicts harvest date, quantity, grade, and readiness for each crop cycle
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowAdd(s => !s)} style={{ padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '0.5rem', color: '#8b5cf6', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 700 }}>
            {showAdd ? '✕ Cancel' : '+ Add Crop Cycle'}
          </button>
          <Link href="/dashboard/command-center" style={{ padding: '0.5rem 0.85rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>
            ← Command Center
          </Link>
        </div>
      </div>

      {/* Add crop cycle form */}
      {showAdd && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.06em' }}>🌱 NEW CROP CYCLE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Crop *</label>
              <select value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', color: '#e2e8d0', fontSize: '0.82rem' }}>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Variety</label>
              <input value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))}
                placeholder="e.g. Nasik Red" style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', color: '#e2e8d0', fontSize: '0.82rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Plot (acres) *</label>
              <input type="number" value={form.plot_acres} onChange={e => setForm(f => ({ ...f, plot_acres: e.target.value }))}
                min="0.1" step="0.5" style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', color: '#e2e8d0', fontSize: '0.82rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Sowing Date *</label>
              <input type="date" value={form.sowing_date} onChange={e => setForm(f => ({ ...f, sowing_date: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', color: '#e2e8d0', fontSize: '0.82rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Expected Qty (qtl)</label>
              <input type="number" value={form.expected_qty_qtl} onChange={e => setForm(f => ({ ...f, expected_qty_qtl: e.target.value }))}
                placeholder="e.g. 50" style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', color: '#e2e8d0', fontSize: '0.82rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          {addMsg && <div style={{ fontSize: '0.78rem', color: addMsg.startsWith('✅') ? '#22c55e' : '#ef4444', marginBottom: '0.5rem' }}>{addMsg}</div>}
          <button onClick={addCycle} disabled={adding} style={{ padding: '0.5rem 1.5rem', background: adding ? '#374151' : 'linear-gradient(135deg,#8b5cf6,#7c3aed)', border: 'none', borderRadius: '0.5rem', color: 'white', fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
            {adding ? 'Adding...' : '+ Add Crop Cycle'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌾</div>
          <div>Analysing harvest readiness...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '0.75rem' }}>{error}</div>
          <Link href="/auth" style={{ padding: '0.6rem 1.5rem', background: '#22c55e', borderRadius: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
        </div>
      ) : (
        <>
          {/* Most ready banner */}
          {mostReady && mostReady.readiness_score >= 60 && (
            <div style={{ padding: '1rem 1.25rem', marginBottom: '1rem', background: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(16,163,74,0.05))', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, marginBottom: '0.15rem' }}>🌾 MOST HARVEST-READY</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f0fdf4' }}>{mostReady.crop} — {mostReady.readiness_score}% Ready</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>~{mostReady.predicted_qty_qtl} qtl • Grade {mostReady.predicted_grade} • Harvest in {mostReady.days_to_harvest} days</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/dashboard/profit-simulator" style={{ padding: '0.4rem 0.85rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.4rem', color: '#22c55e', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>
                  💰 Profit Sim
                </Link>
              </div>
            </div>
          )}

          {/* Forecast cards */}
          {forecasts.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              No active crop cycles. Click <strong>+ Add Crop Cycle</strong> above to start tracking.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {forecasts.map((f: any, i: number) => {
                const rColor = readinessColor(f.readiness_score);
                const stageIdx = STAGES.indexOf(f.stage || 'growth');
                const stageProgress = Math.round(((stageIdx + 1) / STAGES.length) * 100);
                return (
                  <div key={i} className="card" style={{ padding: '1.25rem', border: `1px solid ${rColor}20`, transition: 'border-color 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f0fdf4' }}>{f.crop}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.1rem' }}>{f.plot_acres} acre(s) • Stage: {STAGE_ICONS[f.stage] || '🌱'} {f.stage}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: rColor }}>{f.readiness_score}</div>
                        <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>readiness</div>
                      </div>
                    </div>

                    {/* Readiness bar */}
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginBottom: '0.75rem' }}>
                      <div style={{ width: `${f.readiness_score}%`, height: '100%', background: rColor, borderRadius: '3px', transition: 'width 1s ease' }} />
                    </div>

                    {/* Key metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <div style={{ padding: '0.4rem 0.5rem', background: 'rgba(139,92,246,0.08)', borderRadius: '0.3rem' }}>
                        <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>Harvest Date</div>
                        <div style={{ fontSize: '0.8rem', color: '#e2e8d0', fontWeight: 700 }}>{f.predicted_date}</div>
                      </div>
                      <div style={{ padding: '0.4rem 0.5rem', background: 'rgba(139,92,246,0.08)', borderRadius: '0.3rem' }}>
                        <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>Predicted Qty</div>
                        <div style={{ fontSize: '0.8rem', color: '#e2e8d0', fontWeight: 700 }}>{f.predicted_qty_qtl} qtl</div>
                      </div>
                      <div style={{ padding: '0.4rem 0.5rem', background: 'rgba(139,92,246,0.08)', borderRadius: '0.3rem' }}>
                        <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>Quality Grade</div>
                        <div style={{ fontSize: '0.8rem', color: '#e2e8d0', fontWeight: 700 }}>Grade {f.predicted_grade}</div>
                      </div>
                      <div style={{ padding: '0.4rem 0.5rem', background: 'rgba(139,92,246,0.08)', borderRadius: '0.3rem' }}>
                        <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>Weather Risk</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: weatherRiskColor[f.weather_risk] || '#9ca3af' }}>{f.weather_risk}</div>
                      </div>
                    </div>

                    {/* Stage progress */}
                    <div style={{ fontSize: '0.68rem', color: '#6b7280', marginBottom: '0.3rem' }}>Lifecycle progress</div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {STAGES.map((s, si) => {
                        const done = si <= stageIdx;
                        return (
                          <div key={s} title={`${STAGE_ICONS[s]} ${s}`}
                            style={{ flex: 1, height: '5px', borderRadius: '2px', background: done ? '#8b5cf6' : 'rgba(255,255,255,0.08)', transition: 'background 0.5s' }} />
                        );
                      })}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.2rem' }}>
                      Confidence: {f.confidence_pct}% • Days to harvest: {f.days_to_harvest}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All crop cycles list */}
          {cycles.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>📋 ALL CROP CYCLES ({cycles.length})</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Crop','Acres','Stage','Sown','Expected Harvest','Qty (qtl)','Grade','Active'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: '#6b7280', fontWeight: 600, fontSize: '0.68rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cycles.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.5rem', color: '#e2e8d0', fontWeight: 700 }}>{c.crop}</td>
                        <td style={{ padding: '0.5rem', color: '#9ca3af' }}>{c.plot_acres}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{ padding: '0.15rem 0.45rem', background: 'rgba(139,92,246,0.12)', borderRadius: '0.3rem', color: '#8b5cf6', fontWeight: 600 }}>
                            {STAGE_ICONS[c.stage] || '🌱'} {c.stage}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', color: '#9ca3af' }}>{c.sowing_date}</td>
                        <td style={{ padding: '0.5rem', color: '#9ca3af' }}>{c.expected_harvest_date || '—'}</td>
                        <td style={{ padding: '0.5rem', color: '#9ca3af' }}>{c.expected_qty_qtl || '—'}</td>
                        <td style={{ padding: '0.5rem', color: '#9ca3af' }}>{c.quality_grade || '—'}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{ color: c.is_active ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '0.7rem' }}>{c.is_active ? '✅' : '❌'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
