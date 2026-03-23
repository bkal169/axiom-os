/**
 * TaxIntelPanel — Axiom OS V5
 * 5-tab tax intelligence module.
 */
import { useState } from 'react';
const C = { bg: '#07070e', surface: '#0d0d1a', surfaceHi: '#12121f', border: 'rgba(255,255,255,0.07)', gold: '#e8b84b', text: '#eceaf5', textMid: '#7a8494' };
type Tab = 'codes' | 'property' | 'oz' | 'depreciation' | '1031';
const TABS = [{ id: 'codes' as Tab, label: 'Tax Codes' }, { id: 'property' as Tab, label: 'Property Tax' }, { id: 'oz' as Tab, label: 'Opp. Zones' }, { id: 'depreciation' as Tab, label: 'Depreciation' }, { id: '1031' as Tab, label: '1031 Exchange' }];

export function TaxIntelPanel({ dealId, projectId }: { dealId?: string; projectId?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('codes');
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 20px', gap: 4 }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', fontSize: 13, fontFamily: 'Instrument Sans, sans-serif', color: activeTab === tab.id ? C.gold : C.textMid, borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : '2px solid transparent', marginBottom: -1 }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 24 }}>
        {activeTab === 'codes' && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>Tax code lookup — filter by state and category via /tax/codes API</div>}
        {activeTab === 'property' && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>{dealId ? 'Property tax records from county assessor' : 'Select a deal'}</div>}
        {activeTab === 'oz' && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>{dealId ? 'OZ lookup via /tax/oz/' + dealId : 'Select a deal'}<br/>8,764 IRS OZ tracts indexed | Expires: 2028-12-31</div>}
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
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid }}>2026 Bonus: 20% | TCJA phase-down active</div>
          </div>
        )}
        {activeTab === '1031' && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.textMid }}>1031 Exchange Tracker | 45-day ID deadline | 180-day close{dealId ? ' | Deal: ' + dealId : ''}</div>}
      </div>
    </div>
  );
}
