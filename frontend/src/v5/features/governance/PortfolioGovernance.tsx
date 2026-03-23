/** PortfolioGovernance — Axiom OS V5 */
import { useState, useEffect } from 'react';
const C = { bg: '#0d0d1a', surface: '#12121f', border: 'rgba(255,255,255,0.07)', gold: '#e8b84b', goldDim: 'rgba(232,184,75,0.12)', goldBorder: 'rgba(232,184,75,0.3)', text: '#eceaf5', textMid: '#7a8494' };
type Mode = 'manual' | 'assisted' | 'supervised' | 'autonomous';
const MODES = [
  { id: 'manual' as Mode, label: 'Manual', desc: 'All actions require human approval.' },
  { id: 'assisted' as Mode, label: 'Assisted', desc: 'Agents suggest. You confirm each one.' },
  { id: 'supervised' as Mode, label: 'Supervised', desc: 'Autonomous under cost thresholds.' },
  { id: 'autonomous' as Mode, label: 'Autonomous', desc: 'Full autonomous. Escalate exceptions.' },
];

export function PortfolioGovernance({ orgId, supabase }: { orgId: string; supabase: any }) {
  const [mode, setMode] = useState<Mode>('assisted');
  const [maxCost, setMaxCost] = useState(50000);
  const [threshold, setThreshold] = useState(0.75);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.table('portfolio_governance').select('*').eq('org_id', orgId).single()
      .then(({ data }: any) => { if (data) { setMode(data.autonomy_mode || 'assisted'); setMaxCost(data.max_auto_cost_impact ?? 50000); setThreshold(data.escalation_threshold ?? 0.75); } })
      .catch(() => {}).finally(() => setLoading(false));
  }, [orgId, supabase]);

  const handleSave = () => {
    supabase.table('portfolio_governance').upsert({ org_id: orgId, autonomy_mode: mode, max_auto_cost_impact: maxCost, escalation_threshold: threshold, updated_at: new Date().toISOString() })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }).catch(console.error);
  };

  if (loading) return <div style={{ color: C.textMid, padding: 24 }}>Loading...</div>;

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: C.text, fontSize: 16, margin: '0 0 20px' }}>Portfolio Governance</h3>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Autonomy Mode</div>
        {MODES.map((m) => (
          <div key={m.id} onClick={() => setMode(m.id)} style={{ background: mode === m.id ? C.goldDim : C.surface, border: `1px solid ${mode === m.id ? C.goldBorder : C.border}`, borderRadius: 8, padding: '12px 16px', cursor: 'pointer', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${mode === m.id ? C.gold : C.textMid}`, background: mode === m.id ? C.gold : 'transparent', flexShrink: 0 }} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: C.text, fontSize: 14 }}>{m.label}</span>
            </div>
            <p style={{ color: C.textMid, fontSize: 12, margin: '6px 0 0 24px', fontFamily: 'Instrument Sans, sans-serif' }}>{m.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid, marginBottom: 8 }}>MAX AUTO COST IMPACT ($)</div>
          <input type="number" value={maxCost} onChange={(e) => setMaxCost(Number(e.target.value))} style={{ width: '100%', background: '#12121f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '9px 12px', color: '#eceaf5', fontFamily: 'DM Mono, monospace', fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid, marginBottom: 8 }}>ESCALATION THRESHOLD (0-1)</div>
          <input type="number" min={0} max={1} step={0.05} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} style={{ width: '100%', background: '#12121f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '9px 12px', color: '#eceaf5', fontFamily: 'DM Mono, monospace', fontSize: 13, outline: 'none' }} />
        </div>
      </div>
      <button onClick={handleSave} style={{ background: 'rgba(232,184,75,0.15)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 8, padding: '10px 24px', color: '#e8b84b', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  );
}
