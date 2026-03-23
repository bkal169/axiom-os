import { useState, useCallback } from 'react';

export interface MemoryResult {
  id: string
  tier: 'episodic' | 'semantic' | 'procedural'
  content: string
  metadata: Record<string, unknown>
  score: number           
  semanticScore?: number
  lexicalScore?: number
}

export interface AgentMemoryOptions {
  tenantId: string
  agentId: string
  sessionId?: string
  domain?: string
  projectId?: string
  topK?: number
  tokenBudget?: number
}

export interface AgentMemoryState {
  results: MemoryResult[]
  contextString: string
  isLoading: boolean
  error: string | null
}

export function useAgentMemory(options: AgentMemoryOptions) {
  const [state, setState] = useState<AgentMemoryState>({
    results: [],
    contextString: '',
    isLoading: false,
    error: null,
  })

  const _fetchMemoryFn = async (action: string, payload: any) => {
      const keys = JSON.parse(localStorage.getItem('axiom_keys') || '{}');
      const p = keys.proxyUrl || 'https://ubdhpacoqmlxudcvhyuu.supabase.co/functions/v1';
      let headers: any = { "Content-Type": "application/json" };
      if (keys.anonKey) headers["Authorization"] = `Bearer ${keys.anonKey}`;
      
      const r = await fetch(`${p.replace(/\/+$/, '')}/memory-agent`, {
          method: "POST", headers, body: JSON.stringify({ action, ...payload })
      });
      return await r.json();
  }

  const loadMemory = useCallback(async (query: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }))
    try {
      const data = await _fetchMemoryFn("retrieve", {
        tenantId: options.tenantId,
        query,
        domain: options.domain,
        projectId: options.projectId,
        topK: options.topK ?? 12,
        tokenBudget: options.tokenBudget ?? 3000,
      });
      if(data.error) throw new Error(data.error);

      setState({ results: data.results, contextString: data.contextString, isLoading: false, error: null })
      return { results: data.results, contextString: data.contextString }
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }))
      return null
    }
  }, [options])

  const logEvent = useCallback(async (
    eventType: 'tool_call' | 'decision' | 'output' | 'error' | 'observation',
    content: string,
    metadata?: Record<string, unknown>
  ) => {
    return _fetchMemoryFn("writeEpisodic", {
      tenantId: options.tenantId,
      agentId: options.agentId,
      sessionId: options.sessionId,
      domain: options.domain,
      eventType,
      content,
      metadata,
    })
  }, [options])

  const sendFeedback = useCallback(async (
    memoryId: string,
    tier: 'episodic' | 'semantic' | 'procedural',
    signal: string,
    scoreDelta?: number
  ) => {
    return _fetchMemoryFn("writeFeedback", {
      memoryId,
      memoryTier: tier,
      tenantId: options.tenantId,
      agentId: options.agentId,
      sessionId: options.sessionId,
      signal,
      scoreDelta,
    })
  }, [options])

  return {
    ...state,
    loadMemory,
    logEvent,
    sendFeedback,
  }
}
