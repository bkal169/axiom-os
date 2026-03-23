// AxiomOS — MEMORY_WRITER.ts
// Write path for all three memory tiers
// Handles chunking, embedding, and Supabase upsert

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chunkAndEmbed, embedText } from './EMBEDDING_UTILS'
import type { AgentDomain } from './MEMORY_RETRIEVER'

const supabase = createClient(
  Deno.env.get('SUPABASE_DB_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ============================================================
// TYPES
// ============================================================

export interface EpisodicWriteInput {
  tenantId: string
  agentId: string
  sessionId?: string
  domain?: AgentDomain
  eventType: 'tool_call' | 'decision' | 'output' | 'error' | 'observation'
  content: string
  metadata?: Record<string, unknown>
  importance?: number
  projectId?: string
  parentId?: string
  expiresAt?: Date
}

export interface SemanticWriteInput {
  tenantId: string
  domain?: AgentDomain
  sourceType: 'document' | 'note' | 'web' | 'api' | 'manual'
  sourceId?: string
  sourceTitle?: string
  content: string             // full document text — will be chunked
  metadata?: Record<string, unknown>
  projectId?: string
  tags?: string[]
}

export interface ProceduralWriteInput {
  tenantId?: string           // null = global
  domain?: AgentDomain
  procedureKey: string
  name: string
  description?: string
  content: string
  contentType?: 'rule' | 'tool_schema' | 'workflow' | 'constraint'
  metadata?: Record<string, unknown>
  priority?: number
  version?: number
  embedProcedure?: boolean    // embed for fuzzy lookup (default false)
}

// ============================================================
// TIER 1: WRITE EPISODIC
// Single event — no chunking, single embedding
// ============================================================

export async function writeEpisodic(input: EpisodicWriteInput): Promise<string | null> {
  const embedding = await embedText(input.content)

  const { data, error } = await supabase
    .from('episodic_memory')
    .insert({
      tenant_id: input.tenantId,
      agent_id: input.agentId,
      session_id: input.sessionId ?? null,
      domain: input.domain ?? 'general',
      event_type: input.eventType,
      content: input.content,
      metadata: input.metadata ?? {},
      embedding,
      importance: input.importance ?? 0.5,
      project_id: input.projectId ?? null,
      parent_id: input.parentId ?? null,
      expires_at: input.expiresAt ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[AxiomOS] writeEpisodic error:', error)
    return null
  }

  return data.id
}

// ============================================================
// TIER 2: WRITE SEMANTIC
// Full document — chunk + batch embed + upsert all chunks
// ============================================================

export async function writeSemantic(input: SemanticWriteInput): Promise<string[]> {
  // Chunk + embed
  const chunks = await chunkAndEmbed(input.content)

  if (!chunks.length) return []

  const rows = chunks.map(chunk => ({
    tenant_id: input.tenantId,
    domain: input.domain ?? 'general',
    source_type: input.sourceType,
    source_id: input.sourceId ?? null,
    source_title: input.sourceTitle ?? null,
    content: chunk.content,
    chunk_index: chunk.chunkIndex,
    chunk_total: chunk.chunkTotal,
    metadata: input.metadata ?? {},
    embedding: chunk.embedding,
    project_id: input.projectId ?? null,
    tags: input.tags ?? [],
  }))

  // If source_id provided, delete old chunks first (re-ingestion)
  if (input.sourceId) {
    await supabase
      .from('semantic_memory')
      .delete()
      .eq('tenant_id', input.tenantId)
      .eq('source_id', input.sourceId)
  }

  const { data, error } = await supabase
    .from('semantic_memory')
    .insert(rows)
    .select('id')

  if (error) {
    console.error('[AxiomOS] writeSemantic error:', error)
    return []
  }

  return (data ?? []).map(r => r.id)
}

// ============================================================
// TIER 3: WRITE PROCEDURAL
// Upserts on (tenant_id, procedure_key, version)
// ============================================================

export async function writeProcedural(input: ProceduralWriteInput): Promise<string | null> {
  const embedding = input.embedProcedure
    ? await embedText(`${input.name}: ${input.content}`)
    : null

  const { data, error } = await supabase
    .from('procedural_memory')
    .upsert(
      {
        tenant_id: input.tenantId ?? null,
        domain: input.domain ?? 'general',
        procedure_key: input.procedureKey,
        name: input.name,
        description: input.description ?? null,
        content: input.content,
        content_type: input.contentType ?? 'rule',
        metadata: input.metadata ?? {},
        embedding: embedding ?? null,
        priority: input.priority ?? 50,
        version: input.version ?? 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,procedure_key,version' }
    )
    .select('id')
    .single()

  if (error) {
    console.error('[AxiomOS] writeProcedural error:', error)
    return null
  }

  return data.id
}

// ============================================================
// FEEDBACK WRITE
// Signal from agent or user about a memory's usefulness
// ============================================================

export type FeedbackSignal = 'used' | 'ignored' | 'helpful' | 'irrelevant' | 'harmful'

export async function writeMemoryFeedback({
  memoryId,
  memoryTier,
  tenantId,
  agentId,
  sessionId,
  signal,
  scoreDelta = 0,
  notes,
}: {
  memoryId: string
  memoryTier: 'episodic' | 'semantic' | 'procedural'
  tenantId: string
  agentId?: string
  sessionId?: string
  signal: FeedbackSignal
  scoreDelta?: number
  notes?: string
}): Promise<void> {
  const { error } = await supabase.from('memory_feedback').insert({
    memory_id: memoryId,
    memory_tier: memoryTier,
    tenant_id: tenantId,
    agent_id: agentId ?? null,
    session_id: sessionId ?? null,
    signal,
    score_delta: scoreDelta,
    notes: notes ?? null,
  })

  if (error) console.error('[AxiomOS] writeMemoryFeedback error:', error)

  // Apply score delta to source table
  if (scoreDelta !== 0) {
    const table = memoryTier === 'semantic' ? 'semantic_memory' : 'episodic_memory'
    const field = memoryTier === 'semantic' ? 'relevance_score' : 'importance'
    await supabase.rpc('increment_memory_score', {
      p_table: table,
      p_id: memoryId,
      p_field: field,
      p_delta: scoreDelta,
    })
  }
}
