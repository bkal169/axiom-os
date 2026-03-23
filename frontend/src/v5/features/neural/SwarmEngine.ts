/**
 * SwarmEngine — Axiom OS V5
 * Supabase Realtime subscriber. Tracks all 9 agent pipeline stages.
 */
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentTask {
  id: string;
  agent_type: string;
  label: string;
  status: AgentStatus;
  deal_id: string;
  completed_at?: Date;
}

export const AGENT_LABELS: Record<string, string> = {
  market_researcher: 'Market Research',
  valuator:          'Valuation',
  legal:             'Legal & Compliance',
  strategist:        'Strategy',
  risk_officer:      'Risk Assessment',
  capital_raiser:    'Capital Raise (Equity)',
  debt_capital:      'Debt Capital Markets',
  skeptic:           'Skeptic Review',
  analyst:           'IC Memo Synthesis',
};

export const AGENT_ORDER = Object.keys(AGENT_LABELS);

export class SwarmEngine {
  private tasks = new Map<string, AgentTask>();
  private channel: RealtimeChannel | null = null;
  private onUpdate: (tasks: AgentTask[]) => void;
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  );

  constructor(onUpdate: (tasks: AgentTask[]) => void) {
    this.onUpdate = onUpdate;
  }

  init(dealId: string): void {
    for (const agentType of AGENT_ORDER) {
      this.tasks.set(agentType, {
        id: agentType, agent_type: agentType,
        label: AGENT_LABELS[agentType] ?? agentType,
        status: 'pending', deal_id: dealId,
      });
    }
    this.notify();
  }

  subscribe(dealId: string): void {
    this.channel = this.supabase
      .channel(`v5-events-${dealId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'v5_events',
        filter: `source_id=eq.${dealId}`,
      }, (payload) => {
        const ev = payload.new as { event_type: string; payload: { agent: string } };
        if (ev.event_type === 'agent_completed' && ev.payload?.agent) {
          this.markComplete(ev.payload.agent);
        }
      }).subscribe();
  }

  markComplete(agentType: string): void {
    const task = this.tasks.get(agentType);
    if (task) {
      task.status = 'completed';
      task.completed_at = new Date();
      this.tasks.set(agentType, task);
      this.notify();
    }
  }

  unsubscribe(): void { this.channel?.unsubscribe(); this.channel = null; }
  getTasks(): AgentTask[] { return AGENT_ORDER.map((id) => this.tasks.get(id)!).filter(Boolean); }
  private notify(): void { this.onUpdate(this.getTasks()); }
}
