/** SiteMap3D — Axiom OS V5 placeholder. Install @react-three/fiber three to enable. */
const C = { bg: '#0d0d1a', border: 'rgba(255,255,255,0.07)', textMid: '#7a8494' };
export function SiteMap3D({ lat = 27.3364, lng = -82.5307, projectId }: { lat?: number; lng?: number; projectId?: string }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMid, fontFamily: 'DM Mono, monospace', fontSize: 12, flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 28 }}>🗺</span>
        <span>3D Map — npm install @react-three/fiber @react-three/drei three</span>
      </div>
      <div style={{ padding: '10px 16px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.textMid }}>
        {lat.toFixed(4)}, {lng.toFixed(4)}{projectId ? ` · ${projectId}` : ''}
      </div>
    </div>
  );
}
