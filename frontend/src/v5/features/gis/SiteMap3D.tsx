/**
 * SiteMap3D — Axiom OS V5
 * Canvas-based 2D map visualization. For full 3D: npm install @react-three/fiber @react-three/drei three
 */
import { useEffect, useRef } from 'react';

const C = { bg: '#0d0d1a', surface: '#12121f', border: 'rgba(255,255,255,0.07)', gold: '#e8b84b', green: '#4ade80', text: '#eceaf5', textMid: '#7a8494', grid: 'rgba(255,255,255,0.04)', accent: '#4ea8de' };

interface Props { lat?: number; lng?: number; projectId?: string; zoom?: number; }

export function SiteMap3D({ lat = 27.3364, lng = -82.5307, projectId, zoom = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    const gridSize = 40 * zoom;
    for (let x = 0; x < W; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Surrounding parcels (simulated)
    const parcels = [
      { x: 0.15, y: 0.12, w: 0.18, h: 0.14, color: 'rgba(78,168,222,0.08)', border: 'rgba(78,168,222,0.3)' },
      { x: 0.55, y: 0.15, w: 0.22, h: 0.16, color: 'rgba(74,222,128,0.05)', border: 'rgba(74,222,128,0.2)' },
      { x: 0.10, y: 0.60, w: 0.20, h: 0.18, color: 'rgba(78,168,222,0.06)', border: 'rgba(78,168,222,0.2)' },
      { x: 0.60, y: 0.58, w: 0.25, h: 0.20, color: 'rgba(232,184,75,0.05)', border: 'rgba(232,184,75,0.2)' },
      { x: 0.30, y: 0.72, w: 0.15, h: 0.12, color: 'rgba(78,168,222,0.05)', border: 'rgba(78,168,222,0.15)' },
    ];
    parcels.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x * W, p.y * H, p.w * W, p.h * H);
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x * W, p.y * H, p.w * W, p.h * H);
    });

    // Roads
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(0, H * 0.45); ctx.lineTo(W, H * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.45, 0); ctx.lineTo(W * 0.45, H); ctx.stroke();

    // Subject property marker
    const cx = W * 0.5;
    const cy = H * 0.5;

    // Pulse rings
    [40, 28, 18].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232,184,75,${0.08 + i * 0.06})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Subject parcel box
    ctx.fillStyle = 'rgba(232,184,75,0.12)';
    ctx.fillRect(cx - 40, cy - 30, 80, 60);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 40, cy - 30, 80, 60);

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = C.gold;
    ctx.fill();

    // Compass rose (top-right)
    const cx2 = W - 36, cy2 = 36;
    ctx.fillStyle = C.textMid;
    ctx.font = '10px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx2, cy2 - 18);
    ctx.font = '8px DM Mono, monospace';
    ctx.fillText('S', cx2, cy2 + 22);
    ctx.fillText('E', cx2 + 20, cy2 + 4);
    ctx.fillText('W', cx2 - 20, cy2 + 4);
    ctx.beginPath(); ctx.moveTo(cx2, cy2 - 14); ctx.lineTo(cx2 - 4, cy2 + 2); ctx.lineTo(cx2 + 4, cy2 + 2); ctx.closePath();
    ctx.fillStyle = C.gold; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx2, cy2 + 14); ctx.lineTo(cx2 - 4, cy2 - 2); ctx.lineTo(cx2 + 4, cy2 - 2); ctx.closePath();
    ctx.fillStyle = C.textMid; ctx.fill();

    // Scale bar (bottom-left)
    ctx.fillStyle = C.surface;
    ctx.fillRect(16, H - 32, 104, 20);
    ctx.fillStyle = C.textMid;
    ctx.fillRect(20, H - 24, 96, 4);
    ctx.fillStyle = C.gold;
    ctx.fillRect(20, H - 24, 48, 4);
    ctx.fillStyle = C.textMid;
    ctx.font = '9px DM Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('0', 20, H - 10);
    ctx.textAlign = 'center';
    ctx.fillText('250ft', 68, H - 10);
    ctx.textAlign = 'right';
    ctx.fillText('500ft', 116, H - 10);

    // Coordinates label
    ctx.fillStyle = C.textMid;
    ctx.font = '10px DM Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, 16, 20);
    if (projectId) {
      ctx.fillStyle = C.gold;
      ctx.fillText(projectId, 16, 34);
    }

  }, [lat, lng, projectId, zoom]);

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
    </div>
  );
}
