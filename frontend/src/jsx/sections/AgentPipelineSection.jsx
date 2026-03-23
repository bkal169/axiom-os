import { useState } from 'react';
import { AgentHandoff } from '../../v5/features/neural/AgentHandoff';

const C = { bg: '#0d0d1a', surface: '#12121f', border: 'rgba(255,255,255,0.07)', gold: '#e8b84b', text: '#eceaf5', textMid: '#7a8494' };

export default function AgentPipelineSection({ activeDealId }) {
  const [dealId, setDealId] = useState(activeDealId || '');
  const [inputId, setInputId] = useState('');

  const handleRun = () => {
    if (inputId.trim()) setDealId(inputId.trim());
  };

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: C.text, marginBottom: 24 }}>Agent Pipeline</h2>
      {!dealId ? (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            placeholder="Enter Deal ID to run pipeline..."
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontFamily: 'DM Mono, monospace', fontSize: 13 }}
          />
          <button
            onClick={handleRun}
            style={{ background: C.gold, color: '#0d0d1a', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
          >
            Run Agents
          </button>
        </div>
      ) : (
        <AgentHandoff dealId={dealId} onComplete={() => console.log('Pipeline complete:', dealId)} />
      )}
    </div>
  );
}
