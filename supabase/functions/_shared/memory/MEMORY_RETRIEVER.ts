// AxiomOS — MEMORY_RETRIEVER.ts
// Hybrid retrieval: semantic (pgvector) + lexical (tsvector) + RRF merge
// Used by all agents at context-load time

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { embedText } from './EMBEDDING_UTILS'

const supabase = createClient(
  Deno.env.get('SUPABASE_DB_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ============================================================
// TYPES
// ============================================================

export type AgentDomain =
  | 'real_estate'
  | 'cannabis_fintech'
  | 'healthcare'
  | 'energy'
  | 'hospitality'
  | 'government'
  | 'manufacturing'
  | 'general'

export interface MemoryResult {
  id: string
  tier: 'episodic' | 'semantic' | 'procedural'
  content: string
  metadata: Record<string, unknown>
  score: number           // final RRF score
  semanticScore?: number
  lexicalScore?: number
}

export interface RetrievalOptions {
  tenantId: string
  query: string
  domain?: AgentDomain
  projectId?: string
  topK?: number             // total results to return (default 12)
  semanticThreshold?: number // min cosine similarity (default 0.72)
  includeProcedural?: boolean // always inject procedural (default true)
  tokenBudget?: number      // max tokens to return (default 3000)
}

// ============================================================
// RRF — Reciprocal Rank Fusion
// Standard formula: score = Σ 1 / (k + rank)
// k=60 is conventional default
// ============================================================

const RRF_K = 60

function rrfMerge(
  semanticResults: { id: string; score: number; data: MemoryResult }[],
  lexicalResults: { id: string; score: number; data: MemoryResult }[],
  topK: number
): MemoryResult[] {
  const scores = new Map<string, { rrf: number; sem?: number; lex?: number; data: MemoryResult }>()

  // Apply semantic ranks
  semanticResults.forEach(({ id, score, data }, rank) => {
    const rrfScore = 1 / (RRF_K + rank + 1)
    scores.set(id, { rrf: rrfScore, sem: score, data })
  })

  // Add lexical ranks
  lexicalResults.forEach(({ id, score, data }, rank) => {
    const rrfScore = 1 / (RRF_K + rank + 1)
    const existing = scores.get(id)
    if (existing) {
      existing.rrf += rrfScore
      existing.lex = score
    } else {
      scores.set(id, { rrf: rrfScore, lex: score, data })
    }
  })

  return Array.from(scores.values())
    .sort((a, b) => b.rrf - a.rrf)
    .slice(0, topK)
    .map(({ rrf, sem, lex, data }) => ({
      ...data,
      score: rrf,
      semanticScore: sem,
      lexicalScore: lex,
    }))
}

// ============================================================
// TOKEN BUDGET TRIM
// ============================================================

function applyTokenBudget(results: MemoryResult[], budget: number): MemoryResult[] {
  let total = 0
  const trimmed: MemoryResult[] = []
  for (const r of results) {
    const tokens = Math.ceil(r.content.length / 4)
    if (total + tokens > budget) break
    trimmed.push(r)
    total += tokens
  }
  return trimmed
}

// ============================================================
// EPISODIC RETRIEVAL
// ============================================================

async function retrieveEpisodic(
  embedding: number[],
  tenantId: string,
  domain: AgentDomain | undefined,
  limit: number,
  threshold: number
): Promise<{ id: string; score: number; data: MemoryResult }[]> {
  const { data, error } = await supabase.rpc('search_episodic_memory', {
    p_tenant_id: tenantId,
    p_embedding: embedding,
    p_domain: domain ?? null,
    p_limit: limit,
    p_threshold: threshold,
  })

  if (error) {
    console.error('[AxiomOS] Episodic retrieval error:', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    score: row.similarity,
    data: {
      id: row.id,
      tier: 'episodic' as const,
      content: row.content,
      metadata: row.metadata ?? {},
      score: row.similarity,
    },
  }))
}

// ============================================================
// SEMANTIC RETRIEVAL
// ============================================================

async function retrieveSemantic(
  embedding: number[],
  tenantId: string,
  domain: AgentDomain | undefined,
  projectId: string | undefined,
  limit: number,
  threshold: number
): Promise<{ id: string; score: number; data: MemoryResult }[]> {
  const { data, error } = await supabase.rpc('search_semantic_memory', {
    p_tenant_id: tenantId,
    p_embedding: embedding,
    p_domain: domain ?? null,
    p_project_id: projectId ?? null,
    p_limit: limit,
    p_threshold: threshold,
  })

  if (error) {
    console.error('[AxiomOS] Semantic retrieval error:', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    score: row.similarity,
    data: {
      id: row.id,
      tier: 'semantic' as const,
      content: row.content,
      metadata: { ...row.metadata, source_title: row.source_title, tags: row.tags },
      score: row.similarity,
    },
  }))
}

// ============================================================
// LEXICAL RETRIEVAL
// ============================================================

async function retrieveLexical(
  query: string,
  tenantId: string,
  limit: number
): Promise<{ id: string; score: number; data: MemoryResult }[]> {
  const { data, error } = await supabase.rpc('search_memory_lexical', {
    p_tenant_id: tenantId,
    p_query: query,
    p_limit: limit,
  })

  if (error) {
    console.error('[AxiomOS] Lexical retrieval error:', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    score: row.rank,
    data: {
      id: row.id,
      tier: row.tier as 'episodic' | 'semantic',
      content: row.content,
      metadata: {},
      score: row.rank,
    },
  }))
}

// ============================================================
// PROCEDURAL RETRIEVAL
// Always injected — highest priority rules for the domain
// ============================================================

async function retrieveProcedural(
  tenantId: string,
  domain: AgentDomain | undefined,
  limit: number = 8
): Promise<MemoryResult[]> {
  const { data, error } = await supabase
    .from('procedural_memory')
    .select('id, content, metadata, name, description')
    .eq('status', 'active')
    .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    .eq('domain', domain ?? 'general')
    .order('priority', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AxiomOS] Procedural retrieval error:', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    tier: 'procedural' as const,
    content: row.content,
    metadata: { name: row.name, description: row.description, ...row.metadata },
    score: 1.0, // always max score — procedural always included
  }))
}

// ============================================================
// MAIN RETRIEVER
// ============================================================

export async function retrieveMemory(options: RetrievalOptions): Promise<MemoryResult[]> {
  const {
    tenantId,
    query,
    domain,
    projectId,
    topK = 12,
    semanticThreshold = 0.72,
    includeProcedural = true,
    tokenBudget = 3000,
  } = options

  const embedding = await embedText(query)
  const semanticLimit = Math.ceil(topK * 1.5)
  const lexicalLimit = Math.ceil(topK * 1.0)

  const [episodic, semantic, lexical] = await Promise.all([
    retrieveEpisodic(embedding, tenantId, domain, semanticLimit, semanticThreshold),
    retrieveSemantic(embedding, tenantId, domain, projectId, semanticLimit, semanticThreshold),
    retrieveLexical(query, tenantId, lexicalLimit),
  ])

  const semanticAll = [...episodic, ...semantic].sort((a, b) => b.score - a.score)
  const merged = rrfMerge(semanticAll, lexical, topK)

  let results = merged

  if (includeProcedural) {
    const procedural = await retrieveProcedural(tenantId, domain)
    // Procedural prepended — always first in context
    results = [...procedural, ...merged]
  }

  return applyTokenBudget(results, tokenBudget)
}

// ============================================================
// FORMAT FOR CONTEXT INJECTION
// ============================================================

export function formatMemoryForContext(results: MemoryResult[]): string {
  if (!results.length) return ''

  const sections = {
    procedural: results.filter(r => r.tier === 'procedural'),
    semantic: results.filter(r => r.tier === 'semantic'),
    episodic: results.filter(r => r.tier === 'episodic'),
  }

  const parts: string[] = []

  if (sections.procedural.length) {
    parts.push('## Active Rules & Procedures')
    sections.procedural.forEach(r => {
      const name = r.metadata.name as string
      parts.push(`### ${name ?? 'Rule'}\n${r.content}`)
    })
  }

  if (sections.semantic.length) {
    parts.push('## Relevant Knowledge')
    sections.semantic.forEach(r => {
      const title = r.metadata.source_title as string
      parts.push(`${title ? `**${title}**\n` : ''}${r.content}`)
    })
  }

  if (sections.episodic.length) {
    parts.push('## Recent Agent History')
    sections.episodic.forEach(r => {
      const event = r.metadata.event_type as string
      parts.push(`[${event ?? 'event'}] ${r.content}`)
    })
  }

  return parts.join('\n\n---\n\n')
}
