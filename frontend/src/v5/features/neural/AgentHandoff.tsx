/**
 * AgentHandoff — Axiom OS V5
 * Real-time pipeline display. Subscribes to v5_events via SwarmEngine.
 */
import { useEffect, useState } from 'react';
import { SwarmEngine } from './SwarmEngine';
import type { AgentTask, AgentStatus } from './SwarmEngine';

const C = {
  bg: '#0d0d1a', surface: '#12121f', border: 'rgba(255,255,255,0.07)',
  gold: '#e8b84b', blue: '#4ea8de', green: '#4ade80', red: '#f87171',
  pending: '#3d4454', text: '#eceaf5', textMid: '#7a8494',
};

const STATUS_DOT: Record<AgentStatus, { color: string; glow: boolean }> = {
  pending:   { color: C.pending, glow: false },
  running:   { color: C.blue,    glow: true  },
  completed: { color: C.green,   glow: false },
  failed:    { color: C.red,     glow: false },
};

export function AgentHandoff({ dealId, onComplete }: { dealId: string; onComplete?: () => void }) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [engine] = useState(() => new SwarmEngine(setTasks));

  useEffect(() => {
    engine.init(dealId);
    engine.subscribe(dealId);
    return () => engine.unsubscribe();
  }, [dealId, engine]);

  useEffect(() => {
    if (tasks.length > 0 && tasks.every((t) => t.status === 'completed')) onComplete?.();
  }, [tasks, onComplete]);

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, fontFamily: 'Instrument Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: C.text, fontSize: 16, margin: 0 }}>Agent Pipeline</h3>
        <span style={{ fontFamily: 'DM Mono, monospace', color: C.textMid, fontSize: 12 }}>{completed}/{tasks.length}</span>
      </div>
      <div style={{ height: 3, background: C.surface, borderRadius: 2, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? C.green : C.gold, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tasks.map((task) => {
          const dot = STATUS_DOT[task.status];
          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderRadius: 8, background: C.surface, border: `1px solid ${task.status === 'completed' ? 'rgba(74,222,128,0.15)' : C.border}`, transition: 'border-color 0.3s ease' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: dot.color, boxShadow: dot.glow ? `0 0 8px ${dot.color}` : 'none' }} />
              <span style={{ flex: 1, color: C.text, fontSize: 13 }}>{task.label}</span>
              <span style={{ fontFamily: 'DM Mono, monospace', color: C.textMid, fontSize: 11 }}>{task.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
