/**
 * RiskCalibrationDashboard — Axiom OS V5
 * Brier score trend and TT-SI tracking.
 */
import { useEffect, useState } from 'react';

const C = { bg: '#0d0d1a', surface: '#12121f', border: 'rgba(255,255,255,0.07)', gold: '#e8b84b', green: '#4ade80', red: '#f87171', text: '#eceaf5', textMid: '#7a8494' };

interface RiskEvent { id: string; risk_type: string; predicted_prob: number; brier_score: number | null; tts_applied: boolean; }

export function RiskCalibrationDashboard({ supabase }: { supabase: any }) {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [avgBrier, setAvgBrier] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.table('risk_events').select('*').not('brier_score', 'is', null).order('created_at', { ascending: false }).limit(50).execute()
      .then(({ data }: any) => {
        setEvents(data || []);
        if (data?.length > 0) setAvgBrier(Math.round(data.reduce((s: number, e: any) => s + (e.brier_score ?? 0), 0) / data.length * 1000) / 1000);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [supabase]);

  const baseline = 0.24;
  const improvement = avgBrier !== null ? ((baseline - avgBrier) / baseline * 100).toFixed(1) : null;

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: C.text, fontSize: 16, marginBottom: 20 }}>Risk Calibration</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'BRIER SCORE', value: loading ? '—' : String(avgBrier ?? '—'), color: avgBrier !== null && avgBrier < baseline ? C.green : C.red, sub: `baseline: ${baseline}` },
          { label: 'IMPROVEMENT', value: improvement ? `+${improvement}%` : '—', color: C.green, sub: 'vs naive baseline' },
          { label: 'EVENTS', value: String(events.length), color: C.text, sub: `TT-SI: ${events.filter(e => e.tts_applied).length}` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ flex: 1, background: C.surface, borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid, marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color }}>{value}</div>
            <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
