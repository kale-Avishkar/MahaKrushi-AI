'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface TreatmentData {
  immediate: string[];
  spray_schedule: string;
  organic: string;
  chemical: string;
}

interface Detection {
  disease: string;
  confidence: number;
  severity: string;
  icon: string;
  cause: string;
  spread: string;
  symptoms_matched: string[];
  treatment: TreatmentData;
  prevention: string[];
  lab_action: string;
  favorable: boolean;
  weather_note?: string;
  affected_area_estimate?: string;
  stage?: string;
}

interface ResultData {
  crop: string;
  district?: string;
  conditions?: { temperature: number; humidity: number };
  analysis_time: string;
  detections: Detection[];
  total_found: number;
  disclaimer: string;
  image_filename?: string;
  model?: string;
}

const CROPS = ['Cotton','Grapes','Tomato','Onion','Wheat','Soybean','Sugarcane','Potato','Garlic','Banana'];
const DISTRICTS = ['Nashik','Pune','Nagpur','Aurangabad','Solapur','Amravati','Latur','Jalgaon','Kolhapur','Sangli','Akola','Yavatmal','Nanded'];
const SEASONS = ['Kharif','Rabi','Zaid'];
const COMMON_SYMPTOMS = [
  'yellow leaves','holes in leaves','white powder on leaves','brown spots',
  'leaf curl','wilting','stunted growth','rust colored powder',
  'boll damage','striped leaves','sticky honeydew','root rot',
];

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === 'high'
    ? 'bg-red-900/60 text-red-300 border-red-700/50'
    : severity === 'medium'
    ? 'bg-amber-900/60 text-amber-300 border-amber-700/50'
    : 'bg-green-900/60 text-green-300 border-green-700/50';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cls} uppercase tracking-wide`}>
      {severity === 'high' ? '🔴 High Risk' : severity === 'medium' ? '🟡 Medium Risk' : '🟢 Low Risk'}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-white w-10 text-right">{pct}%</span>
    </div>
  );
}

function DetectionCard({ d, index }: { d: Detection; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <div style={{ borderRadius: '1rem', border: index === 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.2)', background: index === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(13,26,14,0.6)', overflow: 'hidden', marginBottom: '1rem', backdropFilter: 'blur(8px)' }}>
      {/* Header */}
      <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{d.icon}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-bold text-base">{d.disease}</h3>
              {index === 0 && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Primary Match</span>}
              {d.stage && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{d.stage} Stage</span>}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <SeverityBadge severity={d.severity} />
              {d.affected_area_estimate && (
                <span className="text-xs text-gray-400">Area: {d.affected_area_estimate}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-xs text-gray-400 mb-1">AI Confidence</div>
          <div className="w-32"><ConfidenceBar value={d.confidence} /></div>
          <div className="text-gray-500 text-xs mt-2">{expanded ? '▲ Less' : '▼ More'}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Weather note */}
          {d.weather_note && (
            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.8rem', background: d.favorable ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: d.favorable ? '#fca5a5' : '#86efac', border: d.favorable ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(34,197,94,0.2)' }}>
              {d.weather_note}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left col */}
            <div className="space-y-3">
              <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">🦠 Cause</h4>
                <p className="text-gray-200 text-sm">{d.cause}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">📡 How it spreads</h4>
                <p className="text-gray-200 text-sm">{d.spread}</p>
              </div>
              {d.symptoms_matched.length > 0 && (
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">✅ Matched symptoms</h4>
                  <div className="flex flex-wrap gap-1">
                    {d.symptoms_matched.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-900/40 border border-red-700/40 text-red-300 rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right col — Treatment */}
            <div>
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">💊 Treatment Protocol</h4>
              <div className="space-y-2">
                {d.treatment.immediate?.length > 0 && (
                  <div className="p-2 bg-red-900/20 border border-red-700/30 rounded-lg">
                    <div className="text-red-400 text-xs font-bold mb-1">🚨 Immediate Actions</div>
                    {d.treatment.immediate.map((t, i) => (
                      <div key={i} className="text-sm text-gray-200 flex gap-1 mb-0.5">
                        <span className="text-red-400 flex-shrink-0">{i + 1}.</span> {t}
                      </div>
                    ))}
                  </div>
                )}
                {d.treatment.chemical && (
                  <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <div className="text-blue-400 text-xs font-bold mb-1">🧪 Chemical Control</div>
                    <p className="text-sm text-gray-200">{d.treatment.chemical}</p>
                  </div>
                )}
                {d.treatment.organic && (
                  <div className="p-2 bg-green-900/20 border border-green-700/30 rounded-lg">
                    <div className="text-green-400 text-xs font-bold mb-1">🌿 Organic Option</div>
                    <p className="text-sm text-gray-200">{d.treatment.organic}</p>
                  </div>
                )}
                {d.treatment.spray_schedule && (
                  <div className="p-2 bg-gray-800/60 rounded-lg">
                    <div className="text-gray-400 text-xs font-bold mb-1">📅 Spray Schedule</div>
                    <p className="text-sm text-gray-200">{d.treatment.spray_schedule}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prevention */}
          <div>
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">🛡️ Prevention</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {d.prevention.map((p, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-200 bg-gray-800/40 rounded p-1.5">
                  <span className="text-green-400 flex-shrink-0">✓</span> {p}
                </div>
              ))}
            </div>
          </div>

          {/* Lab action */}
          <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-xl flex gap-3 items-start">
            <span className="text-xl">🧪</span>
            <div>
              <div className="text-purple-300 text-xs font-bold mb-0.5">Lab / Expert Action Required</div>
              <p className="text-gray-200 text-sm">{d.lab_action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiseasePage() {
  const [mode, setMode] = useState<'symptom' | 'image'>('symptom');
  const [crop, setCrop] = useState('Cotton');
  const [symptoms, setSymptoms] = useState('');
  const [district, setDistrict] = useState('Nashik');
  const [season, setSeason] = useState('Kharif');
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState('');

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => {
      const parts = prev.split(',').map(x => x.trim()).filter(Boolean);
      if (parts.includes(s)) return parts.filter(x => x !== s).join(', ');
      return [...parts, s].join(', ');
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let data: ResultData;
      if (mode === 'image' && imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        fd.append('crop', crop);
        fd.append('district', district);
        fd.append('temperature', temperature.toString());
        fd.append('humidity', humidity.toString());
        const r = await fetch(`${API}/disease/detect-image`, { method: 'POST', body: fd });
        if (!r.ok) throw new Error(await r.text());
        data = await r.json();
      } else {
        const r = await fetch(`${API}/disease/detect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crop, symptoms, district, season, temperature, humidity }),
        });
        if (!r.ok) throw new Error(await r.text());
        data = await r.json();
      }
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'radial-gradient(ellipse at 20% 20%, #0d260d 0%, #0a0f0a 60%), radial-gradient(ellipse at 80% 80%, #1a2f0a 0%, transparent 50%)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(34,197,94,0.1)', background: 'rgba(13,26,14,0.6)', backdropFilter: 'blur(12px)', marginBottom: '1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-green-900/20" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>🔬</div>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight">AI Disease Detection</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.2rem' }}>Symptom-based & image crop disease analysis for Maharashtra farms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Mode switch */}
            <div style={{ display: 'flex', background: 'rgba(34,197,94,0.06)', borderRadius: '0.75rem', padding: '0.35rem', gap: '0.35rem' }}>
              {(['symptom', 'image'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer', background: mode === m ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'transparent', color: mode === m ? 'white' : '#6b7280' }}>
                  {m === 'symptom' ? '📝 Symptoms' : '📷 Image'}
                </button>
              ))}
            </div>

            {/* Crop + location */}
            <div style={{ background: 'rgba(13,26,14,0.7)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ color: '#f0fdf4', fontWeight: 700, fontSize: '0.9rem' }}>Crop & Location</h3>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Crop *</label>
                <select value={crop} onChange={e => setCrop(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', padding: '0.7rem', color: 'white', fontSize: '0.85rem' }}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>District</label>
                  <select value={district} onChange={e => setDistrict(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', padding: '0.7rem', color: 'white', fontSize: '0.85rem' }}>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Season</label>
                  <select value={season} onChange={e => setSeason(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', padding: '0.7rem', color: 'white', fontSize: '0.85rem' }}>
                    {SEASONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block' }}>Temp: <span style={{ color: 'white' }}>{temperature}°C</span></label>
                  <input type="range" min={15} max={45} value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-full accent-green-500" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block' }}>Humidity: <span style={{ color: 'white' }}>{humidity}%</span></label>
                  <input type="range" min={20} max={100} value={humidity} onChange={e => setHumidity(+e.target.value)} className="w-full accent-green-500" />
                </div>
              </div>
            </div>

            {/* Symptoms or Image */}
            {mode === 'symptom' ? (
              <div style={{ background: 'rgba(13,26,14,0.7)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ color: '#f0fdf4', fontWeight: 700, fontSize: '0.9rem' }}>Describe Symptoms</h3>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3}
                  placeholder="Describe what you see on the plant... e.g. yellow leaves, holes in bolls"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.75rem', padding: '0.7rem', color: 'white', fontSize: '0.85rem', resize: 'none' }} />
                <div>
                  <p className="text-xs text-gray-400 mb-2">Quick select symptoms:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMMON_SYMPTOMS.map(s => {
                      const active = symptoms.includes(s);
                      return (
                        <button key={s} onClick={() => toggleSymptom(s)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', border: `1px solid ${active ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.1)'}`, background: active ? 'rgba(34,197,94,0.15)' : 'transparent', color: active ? '#4ade80' : '#9ca3af', cursor: 'pointer', transition: 'all 0.25s' }}>
                          {active ? '✓ ' : ''}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(13,26,14,0.7)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ color: '#f0fdf4', fontWeight: 700, fontSize: '0.9rem' }}>Upload Plant Image</h3>
                <label className="block cursor-pointer">
                  <div style={{ border: '2px dashed rgba(34,197,94,0.3)', borderRadius: '1rem', padding: '2rem', textAlign: 'center', transition: 'all 0.2s', background: imagePreview ? 'transparent' : 'rgba(0,0,0,0.2)' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" style={{ maxHeight: '160px', margin: '0 auto', borderRadius: '0.75rem', objectFit: 'cover' }} />
                    ) : (
                      <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Click to upload plant/leaf image</p>
                        <p style={{ color: '#4b5563', fontSize: '0.7rem', marginTop: '0.25rem' }}>JPG, PNG, WEBP • Max 10MB</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imageFile && (
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#4ade80' }}>✓</span> {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ color: '#ef4444', marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                )}
              </div>
            )}

            <button onClick={analyze} disabled={loading || (mode === 'image' && !imageFile)}
              style={{ width: '100%', padding: '0.9rem', background: (loading || (mode === 'image' && !imageFile)) ? '#1f2937' : 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: (loading || (mode === 'image' && !imageFile)) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', boxShadow: (loading || (mode === 'image' && !imageFile)) ? 'none' : '0 10px 25px rgba(22,163,74,0.3)' }}>
              {loading ? '⏳ Analyzing...' : <>🔬 {mode === 'image' ? 'Analyze Image' : 'Detect Diseases'}</>}
            </button>

            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem' }}>⚠️ {error}</div>
            )}
          </div>

          {/* Results panel */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 1rem', background: 'rgba(13,26,14,0.4)', borderRadius: '1rem', border: '1px dashed rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
                <h3 style={{ color: '#d1d5db', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ready to Analyze</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', maxWidth: '300px', lineHeight: 1.5 }}>Select your crop, describe symptoms or upload a plant photo, then click Detect to get an AI-powered disease analysis with treatment protocols.</p>
              </div>
            )}

            {loading && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', background: 'rgba(13,26,14,0.4)', borderRadius: '1rem', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div className="w-12 h-12 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin mb-4" />
                <p style={{ color: '#d1d5db', fontWeight: 600 }}>Running disease analysis...</p>
                <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>Checking symptom patterns, weather conditions, disease database</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Analysis summary */}
                <div style={{ background: 'rgba(13,26,14,0.7)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '1rem', padding: '1rem' }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-white font-bold" style={{ fontSize: '1.1rem' }}>Analysis: {result.crop}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        {result.district && `📍 ${result.district} • `}
                        {result.conditions && `🌡️ ${result.conditions.temperature}°C, ${result.conditions.humidity}% humidity • `}
                        🕐 {new Date(result.analysis_time).toLocaleTimeString('en-IN')}
                      </div>
                      {result.model && <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '0.2rem' }}>Model: {result.model}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 800 }}>
                        {result.total_found} disease{result.total_found !== 1 ? 's' : ''} identified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detections */}
                {result.detections.length > 0 ? (
                  result.detections.map((d, i) => <DetectionCard key={i} d={d} index={i} />)
                ) : (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <div className="text-green-300 font-bold">No diseases detected</div>
                    <p className="text-gray-400 text-sm mt-1">Your crop appears healthy based on the symptoms provided. Continue regular field monitoring.</p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="p-3 bg-gray-800/50 border border-gray-700/30 rounded-xl text-xs text-gray-500">
                  ⚠️ {result.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
