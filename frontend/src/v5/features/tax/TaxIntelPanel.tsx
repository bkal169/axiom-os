/**
 * TaxIntelPanel — Axiom OS V5
 * 5-tab tax intelligence module.
 * Tabs with unready backend APIs show a "Coming Q3 2026" badge.
 */
import { useState, useEffect } from 'react';
const C = { bg: '#07070e', surface: '#0d0d1a', surfaceHi: '#12121f', border: 'rgba(255,255,255,0.07)', gold: '#e8b84b', text: '#eceaf5', textMid: '#7a8494' };
type Tab = 'codes' | 'property' | 'oz' | 'depreciation' | '1031';
const API_TABS: Tab[] = ['codes', 'property', 'oz'];
const TABS = [{ id: 'codes' as Tab, label: 'Tax Codes' }, { id: 'property' as Tab, label: 'Property Tax' }, { id: 'oz' as Tab, label: 'Opp. Zones' }, { id: 'depreciation' as Tab, label: 'Depreciation' }, { id: '1031' as Tab, label: '1031 Exchange' }];

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL ?? (import.meta as any).env?.DEV ? 'http://localhost:8000' : '';

const TAB_DESCRIPTIONS: Record<string, string> = {
  codes: 'Tax code lookup by state and category — connects to the /tax/codes endpoint for jurisdiction-specific rates, exemptions, and special assessments.',
  property: 'Property tax assessment, annual tax, and effective rate from county assessor records — connects to the /tax/assess endpoint.',
  oz: 'Opportunity Zone qualification lookup across 8,764 IRS-designated census tracts — connects to the /tax/oz endpoint.',
};

function ComingQ3Badge({ description }: { description: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 16 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.25)', borderRadius: 20, padding: '6px 16px' }}>
        <span style={{ fontSize: 14, color: C.gold, fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: 1 }}>Coming Q3 2026</span>
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid, textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
        {description}
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: C.textMid, opacity: 0.5 }}>
        Backend API endpoint not yet deployed
      </div>
    </div>
  );
}

export function TaxIntelPanel({ dealId, lat, lng }: { dealId?: string; projectId?: string; lat?: number; lng?: number }) {
  const [activeTab, setActiveTab] = useState<Tab>('depreciation');
  const [backendReady, setBackendReady] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [macrs, setMacrs] = useState<any>(null);
  const [ozStatus, setOzStatus] = useState<any>(null);
  const [loadingAssess, setLoadingAssess] = useState(false);
  const [loadingMacrs, setLoadingMacrs] = useState(false);
  const [loadingOz, setLoadingOz] = useState(false);

  // Probe backend availability once on mount
  useEffect(() => {
    if (!BACKEND_URL) return;
    fetch(`${BACKEND_URL}/tax/assess`, { method: 'OPTIONS' })
      .then(r => { if (r.ok || r.status === 405 || r.status === 200) setBackendReady(true); })
      .catch(() => { /* backend not available */ });
  }, []);

  // Fetch full tax assessment when dealId is available AND backend is ready
  useEffect(() => {
    if (!dealId || !backendReady) return;
    setLoadingAssess(true);
    fetch(`${BACKEND_URL}/tax/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id: dealId, lat, lng }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAssessment(data); })
      .catch(() => {})
      .finally(() => setLoadingAssess(false));
  }, [dealId, lat, lng, backendReady]);

  // Fetch MACRS depreciation schedule when depreciation tab is active
  useEffect(() => {
    if (activeTab !== 'depreciation' || !dealId || !backendReady) return;
    setLoadingMacrs(true);
    const cost = assessment?.assessed_value ?? 1000000;
    const propertyType = assessment?.property_type ?? 'commercial';
    const placedInService = assessment?.placed_in_service ?? new Date().toISOString().slice(0, 10);
    fetch(`${BACKEND_URL}/tax/macrs?cost=${cost}&property_type=${encodeURIComponent(propertyType)}&placed_in_service=${placedInService}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setMacrs(data); })
      .catch(() => {})
      .finally(() => setLoadingMacrs(false));
  }, [activeTab, dealId, assessment, backendReady]);

  // Fetch OZ status when oz tab is active AND backend is ready
  useEffect(() => {
    if (activeTab !== 'oz' || !dealId || !backendReady) return;
    const tract = assessment?.census_tract;
    if (!tract) return;
    setLoadingOz(true);
    fetch(`${BACKEND_URL}/tax/oz/${encodeURIComponent(tract)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setOzStatus(data); })
      .catch(() => {})
      .finally(() => setLoadingOz(false));
  }, [activeTab, dealId, assessment, backendReady]);

  const isApiTab = (tab: Tab) => API_TABS.includes(tab);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 20px', gap: 4 }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', fontSize: 13, fontFamily: 'Instrument Sans, sans-serif', color: activeTab === tab.id ? C.gold : C.textMid, borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : '2px solid transparent', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6 }}>
            {tab.label}
            {isApiTab(tab.id) && !backendReady && (
              <span style={{ fontSize: 9, background: 'rgba(232,184,75,0.15)', color: C.gold, borderRadius: 8, padding: '2px 6px', fontWeight: 600, letterSpacing: 0.5 }}>Q3</span>
            )}
          </button>
        ))}
      </div>
      <div style={{ padding: 24 }}>
        {activeTab === 'codes' && (
          !backendReady ? <ComingQ3Badge description={TAB_DESCRIPTIONS.codes} /> : (
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>
            {loadingAssess ? 'Loading assessment...' : assessment ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(assessment, null, 2)}</pre>
            ) : 'Tax code lookup — filter by state and category via /tax/codes API'}
          </div>
          )
        )}
        {activeTab === 'property' && (
          !backendReady ? <ComingQ3Badge description={TAB_DESCRIPTIONS.property} /> : (
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>
            {loadingAssess ? 'Loading...' : dealId ? (
              assessment ? (
                <div>
                  <div style={{ marginBottom: 8, color: C.text }}>Assessed Value: <span style={{ color: C.gold }}>${(assessment.assessed_value ?? 0).toLocaleString()}</span></div>
                  <div style={{ marginBottom: 8 }}>Annual Tax: <span style={{ color: C.gold }}>${(assessment.annual_tax ?? 0).toLocaleString()}</span></div>
                  <div>Effective Rate: <span style={{ color: C.gold }}>{((assessment.effective_rate ?? 0) * 100).toFixed(3)}%</span></div>
                </div>
              ) : 'Property tax records from county assessor'
            ) : 'Select a deal'}
          </div>
          )
        )}
        {activeTab === 'oz' && (
          !backendReady ? <ComingQ3Badge description={TAB_DESCRIPTIONS.oz} /> : (
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>
            {loadingOz ? 'Loading OZ status...' : ozStatus ? (
              <div>
                <div style={{ marginBottom: 8, color: ozStatus.is_oz ? C.gold : C.textMid }}>OZ Status: <strong>{ozStatus.is_oz ? 'QUALIFIED OPPORTUNITY ZONE' : 'Not in OZ'}</strong></div>
                {ozStatus.census_tract && <div style={{ marginBottom: 4 }}>Census Tract: {ozStatus.census_tract}</div>}
                {ozStatus.state && <div>State: {ozStatus.state}</div>}
              </div>
            ) : (
              <div>{dealId ? `OZ lookup via /tax/oz/${assessment?.census_tract ?? '...'}` : 'Select a deal'}<br/>8,764 IRS OZ tracts indexed | Expires: 2028-12-31</div>
            )}
          </div>
          )
        )}
        {activeTab === 'depreciation' && (
          <div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              {[['Residential','27.5 yr'],['Commercial','39 yr'],['Land Improve','15 yr'],['Equipment','5-7 yr']].map(([l, v]) => (
                <div key={l} style={{ background: C.surfaceHi, borderRadius: 8, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.textMid }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: 'Syne, sans-serif' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid, marginBottom: 12 }}>2026 Bonus: 20% | TCJA phase-down active</div>
            {loadingMacrs ? (
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid }}>Loading MACRS schedule...</div>
            ) : macrs?.schedule?.length > 0 ? (
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid, marginBottom: 8 }}>MACRS SCHEDULE (from /tax/macrs)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                  {macrs.schedule.slice(0, 10).map((row: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid }}>
                      <span>Year {row.year ?? i + 1}</span>
                      <span style={{ color: C.gold }}>${(row.deduction ?? 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
        {activeTab === '1031' && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>1031 Exchange Tracker | 45-day ID deadline | 180-day close{dealId ? ' | Deal: ' + dealId : ''}</div>}
      </div>
    </div>
  );
}
