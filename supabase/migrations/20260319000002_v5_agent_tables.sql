-- V5 Agent Pipeline tables

-- v5_events: real-time agent pipeline events via Supabase Realtime
CREATE TABLE IF NOT EXISTS v5_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'agent_started', 'agent_completed', 'agent_failed', 'pipeline_complete'
  agent_name TEXT, -- 'market_researcher', 'valuator', 'legal', 'strategist', 'risk_officer', 'capital_raiser', 'debt_capital', 'skeptic', 'analyst'
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v5_events_deal ON v5_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_v5_events_type ON v5_events(event_type);
CREATE INDEX IF NOT EXISTS idx_v5_events_created ON v5_events(created_at DESC);

-- Enable Realtime for v5_events
ALTER PUBLICATION supabase_realtime ADD TABLE v5_events;

-- deal_analyses: structured outputs from agent pipeline
CREATE TABLE IF NOT EXISTS deal_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID UNIQUE NOT NULL,
  market_research JSONB DEFAULT '{}',
  valuation JSONB DEFAULT '{}',
  legal_review JSONB DEFAULT '{}',
  strategy JSONB DEFAULT '{}',
  risk_assessment JSONB DEFAULT '{}',
  capital_structure JSONB DEFAULT '{}',
  debt_terms JSONB DEFAULT '{}',
  devil_advocate JSONB DEFAULT '{}',
  final_analysis JSONB DEFAULT '{}',
  pipeline_status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_analyses_deal ON deal_analyses(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_analyses_status ON deal_analyses(pipeline_status);

-- semantic_memory: pgvector embeddings store
CREATE TABLE IF NOT EXISTS semantic_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  entity_type TEXT NOT NULL, -- 'deal', 'market_report', 'risk_note', 'user_note'
  entity_id UUID,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_semantic_memory_org ON semantic_memory(org_id);
CREATE INDEX IF NOT EXISTS idx_semantic_memory_entity ON semantic_memory(entity_type, entity_id);
-- pgvector HNSW index for ANN search
CREATE INDEX IF NOT EXISTS idx_semantic_memory_embedding ON semantic_memory 
  USING hnsw (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE v5_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_memory ENABLE ROW LEVEL SECURITY;

-- Permissive policy for v5_events (service role handles inserts)
CREATE POLICY "authenticated_read_v5_events" ON v5_events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "service_insert_v5_events" ON v5_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "authenticated_read_analyses" ON deal_analyses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "service_write_analyses" ON deal_analyses
  FOR ALL WITH CHECK (true);

CREATE POLICY "org_isolation_semantic" ON semantic_memory
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR org_id IS NULL);

-- Trigger for updated_at
CREATE TRIGGER update_deal_analyses_updated_at
  BEFORE UPDATE ON deal_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Semantic memory similarity search function
CREATE OR REPLACE FUNCTION match_semantic_memory(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_entity_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    sm.id,
    sm.entity_type,
    sm.entity_id,
    sm.content,
    sm.metadata,
    1 - (sm.embedding <=> query_embedding) AS similarity
  FROM semantic_memory sm
  WHERE
    (filter_entity_type IS NULL OR sm.entity_type = filter_entity_type)
    AND 1 - (sm.embedding <=> query_embedding) > match_threshold
  ORDER BY sm.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
