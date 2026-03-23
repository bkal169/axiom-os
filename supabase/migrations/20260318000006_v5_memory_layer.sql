-- AxiomOS Agent Memory Schema
-- Supabase Migration: 001_agent_memory
-- Run via: supabase db push or paste in Supabase SQL editor

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE memory_tier AS ENUM ('episodic', 'semantic', 'procedural');
CREATE TYPE memory_status AS ENUM ('active', 'archived', 'expired');
CREATE TYPE agent_domain AS ENUM (
  'real_estate',
  'cannabis_fintech',
  'healthcare',
  'energy',
  'hospitality',
  'government',
  'manufacturing',
  'general'
);

-- ============================================================
-- TIER 1: EPISODIC MEMORY
-- What happened — agent runs, decisions, tool outputs
-- ============================================================

CREATE TABLE episodic_memory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL,
  agent_id      TEXT NOT NULL,
  session_id    UUID,
  domain        agent_domain NOT NULL DEFAULT 'general',

  -- Content
  event_type    TEXT NOT NULL,           -- 'tool_call', 'decision', 'output', 'error'
  content       TEXT NOT NULL,           -- raw text of the event
  metadata      JSONB DEFAULT '{}',      -- tool name, params, result summary, etc.

  -- Vector
  embedding     vector(1536),            -- text-embedding-3-small

  -- Lexical
  content_tsv   tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,

  -- Lifecycle
  status        memory_status NOT NULL DEFAULT 'active',
  importance    FLOAT DEFAULT 0.5,       -- 0.0–1.0, agent or system assigned
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,             -- null = never expires

  -- Soft relations
  project_id    TEXT,
  parent_id     UUID REFERENCES episodic_memory(id)
);

CREATE INDEX episodic_embedding_idx ON episodic_memory
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX episodic_tsv_idx ON episodic_memory USING GIN (content_tsv);
CREATE INDEX episodic_tenant_domain_idx ON episodic_memory (tenant_id, domain, status);
CREATE INDEX episodic_session_idx ON episodic_memory (session_id);
CREATE INDEX episodic_created_idx ON episodic_memory (created_at DESC);

-- ============================================================
-- TIER 2: SEMANTIC MEMORY
-- What we know — documents, project knowledge, domain facts
-- ============================================================

CREATE TABLE semantic_memory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL,
  domain        agent_domain NOT NULL DEFAULT 'general',

  -- Source tracking
  source_type   TEXT NOT NULL,           -- 'document', 'note', 'web', 'api', 'manual'
  source_id     TEXT,                    -- external doc ID if applicable
  source_title  TEXT,

  -- Chunk content
  content       TEXT NOT NULL,
  chunk_index   INT NOT NULL DEFAULT 0,  -- position within source document
  chunk_total   INT,                     -- total chunks from source
  metadata      JSONB DEFAULT '{}',      -- tags, author, date, custom fields

  -- Vector
  embedding     vector(1536),

  -- Lexical
  content_tsv   tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,

  -- Lifecycle
  status        memory_status NOT NULL DEFAULT 'active',
  relevance_score FLOAT DEFAULT 1.0,     -- decays over time or by agent feedback
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Relations
  project_id    TEXT,
  tags          TEXT[] DEFAULT '{}'
);

CREATE INDEX semantic_embedding_idx ON semantic_memory
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX semantic_tsv_idx ON semantic_memory USING GIN (content_tsv);
CREATE INDEX semantic_tenant_domain_idx ON semantic_memory (tenant_id, domain, status);
CREATE INDEX semantic_project_idx ON semantic_memory (tenant_id, project_id);
CREATE INDEX semantic_tags_idx ON semantic_memory USING GIN (tags);
CREATE INDEX semantic_source_idx ON semantic_memory (tenant_id, source_id);

-- ============================================================
-- TIER 3: PROCEDURAL MEMORY
-- How to act — tools, rules, workflows, constraints
-- ============================================================

CREATE TABLE procedural_memory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID,                    -- null = global/system-level
  domain        agent_domain NOT NULL DEFAULT 'general',

  -- Identity
  procedure_key TEXT NOT NULL,           -- machine-readable key, e.g. 'underwriting_rules_v2'
  name          TEXT NOT NULL,
  description   TEXT,

  -- Content
  content       TEXT NOT NULL,           -- the rule, schema, workflow definition
  content_type  TEXT NOT NULL DEFAULT 'rule',  -- 'rule', 'tool_schema', 'workflow', 'constraint'
  metadata      JSONB DEFAULT '{}',

  -- Optional embedding for fuzzy procedure lookup
  embedding     vector(1536),

  -- Lifecycle
  status        memory_status NOT NULL DEFAULT 'active',
  version       INT NOT NULL DEFAULT 1,
  priority      INT NOT NULL DEFAULT 50, -- higher = injected first
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, procedure_key, version)
);

CREATE INDEX procedural_embedding_idx ON procedural_memory
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX procedural_tenant_domain_idx ON procedural_memory (tenant_id, domain, status);
CREATE INDEX procedural_key_idx ON procedural_memory (procedure_key);
CREATE INDEX procedural_priority_idx ON procedural_memory (domain, priority DESC);

-- ============================================================
-- MEMORY FEEDBACK
-- Agent and user signals to improve future retrieval ranking
-- ============================================================

CREATE TABLE memory_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id     UUID NOT NULL,
  memory_tier   memory_tier NOT NULL,
  tenant_id     UUID NOT NULL,
  agent_id      TEXT,
  session_id    UUID,

  signal        TEXT NOT NULL,           -- 'used', 'ignored', 'helpful', 'irrelevant', 'harmful'
  score_delta   FLOAT DEFAULT 0.0,       -- adjustment to importance/relevance score
  notes         TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedback_memory_idx ON memory_feedback (memory_id, memory_tier);
CREATE INDEX feedback_tenant_idx ON memory_feedback (tenant_id, created_at DESC);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Semantic search: episodic
CREATE OR REPLACE FUNCTION search_episodic_memory(
  p_tenant_id   UUID,
  p_embedding   vector(1536),
  p_domain      agent_domain DEFAULT NULL,
  p_limit       INT DEFAULT 10,
  p_threshold   FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  id UUID, content TEXT, metadata JSONB, event_type TEXT,
  similarity FLOAT, created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
  SELECT
    id, content, metadata, event_type,
    1 - (embedding <=> p_embedding) AS similarity,
    created_at
  FROM episodic_memory
  WHERE
    tenant_id = p_tenant_id
    AND status = 'active'
    AND (p_domain IS NULL OR domain = p_domain)
    AND (expires_at IS NULL OR expires_at > now())
    AND 1 - (embedding <=> p_embedding) > p_threshold
  ORDER BY embedding <=> p_embedding
  LIMIT p_limit;
$$;

-- Semantic search: semantic tier
CREATE OR REPLACE FUNCTION search_semantic_memory(
  p_tenant_id   UUID,
  p_embedding   vector(1536),
  p_domain      agent_domain DEFAULT NULL,
  p_project_id  TEXT DEFAULT NULL,
  p_limit       INT DEFAULT 10,
  p_threshold   FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  id UUID, content TEXT, metadata JSONB, source_title TEXT,
  similarity FLOAT, tags TEXT[]
)
LANGUAGE sql STABLE AS $$
  SELECT
    id, content, metadata, source_title,
    1 - (embedding <=> p_embedding) AS similarity,
    tags
  FROM semantic_memory
  WHERE
    tenant_id = p_tenant_id
    AND status = 'active'
    AND (p_domain IS NULL OR domain = p_domain)
    AND (p_project_id IS NULL OR project_id = p_project_id)
    AND 1 - (embedding <=> p_embedding) > p_threshold
  ORDER BY embedding <=> p_embedding
  LIMIT p_limit;
$$;

-- Lexical search: hybrid boost
CREATE OR REPLACE FUNCTION search_memory_lexical(
  p_tenant_id   UUID,
  p_query       TEXT,
  p_limit       INT DEFAULT 10
)
RETURNS TABLE (
  id UUID, tier TEXT, content TEXT, rank FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT id, 'episodic' AS tier, content,
         ts_rank(content_tsv, websearch_to_tsquery('english', p_query)) AS rank
  FROM episodic_memory
  WHERE tenant_id = p_tenant_id AND status = 'active'
    AND content_tsv @@ websearch_to_tsquery('english', p_query)
  UNION ALL
  SELECT id, 'semantic' AS tier, content,
         ts_rank(content_tsv, websearch_to_tsquery('english', p_query)) AS rank
  FROM semantic_memory
  WHERE tenant_id = p_tenant_id AND status = 'active'
    AND content_tsv @@ websearch_to_tsquery('english', p_query)
  ORDER BY rank DESC
  LIMIT p_limit;
$$;

-- Decay relevance scores on semantic memory (run on a schedule)
CREATE OR REPLACE FUNCTION decay_semantic_relevance()
RETURNS void LANGUAGE sql AS $$
  UPDATE semantic_memory
  SET relevance_score = GREATEST(0.1, relevance_score * 0.98),
      updated_at = now()
  WHERE status = 'active'
    AND updated_at < now() - INTERVAL '7 days';
$$;
-- AxiomOS Agent Memory — Row Level Security
-- Run AFTER SCHEMA.sql
-- Enforces tenant isolation across all memory tables

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE episodic_memory   ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_memory   ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedural_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_feedback   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- EPISODIC MEMORY
-- ============================================================

-- Tenant can read/write their own episodic memory
CREATE POLICY episodic_tenant_select ON episodic_memory
  FOR SELECT USING (
    tenant_id = auth.uid()
  );

CREATE POLICY episodic_tenant_insert ON episodic_memory
  FOR INSERT WITH CHECK (
    tenant_id = auth.uid()
  );

CREATE POLICY episodic_tenant_update ON episodic_memory
  FOR UPDATE USING (
    tenant_id = auth.uid()
  );

-- Service role bypasses RLS (for server-side writes)
CREATE POLICY episodic_service_all ON episodic_memory
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- ============================================================
-- SEMANTIC MEMORY
-- ============================================================

CREATE POLICY semantic_tenant_select ON semantic_memory
  FOR SELECT USING (
    tenant_id = auth.uid()
  );

CREATE POLICY semantic_tenant_insert ON semantic_memory
  FOR INSERT WITH CHECK (
    tenant_id = auth.uid()
  );

CREATE POLICY semantic_tenant_update ON semantic_memory
  FOR UPDATE USING (
    tenant_id = auth.uid()
  );

CREATE POLICY semantic_service_all ON semantic_memory
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- ============================================================
-- PROCEDURAL MEMORY
-- Global procedures (tenant_id IS NULL) visible to all
-- Tenant-specific procedures visible only to that tenant
-- ============================================================

CREATE POLICY procedural_select ON procedural_memory
  FOR SELECT USING (
    tenant_id IS NULL OR tenant_id = auth.uid()
  );

-- Only service role can write procedural memory
-- (Procedures are system-managed, not user-written)
CREATE POLICY procedural_service_write ON procedural_memory
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- ============================================================
-- MEMORY FEEDBACK
-- ============================================================

CREATE POLICY feedback_tenant_select ON memory_feedback
  FOR SELECT USING (
    tenant_id = auth.uid()
  );

CREATE POLICY feedback_tenant_insert ON memory_feedback
  FOR INSERT WITH CHECK (
    tenant_id = auth.uid()
  );

CREATE POLICY feedback_service_all ON memory_feedback
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- ============================================================
-- HELPER: increment_memory_score
-- Used by writeMemoryFeedback to adjust relevance/importance
-- Must run as security definer to update scores server-side
-- ============================================================

CREATE OR REPLACE FUNCTION increment_memory_score(
  p_table TEXT,
  p_id    UUID,
  p_field TEXT,
  p_delta FLOAT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_table = 'semantic_memory' AND p_field = 'relevance_score' THEN
    UPDATE semantic_memory
    SET relevance_score = GREATEST(0.0, LEAST(2.0, relevance_score + p_delta)),
        updated_at = now()
    WHERE id = p_id;

  ELSIF p_table = 'episodic_memory' AND p_field = 'importance' THEN
    UPDATE episodic_memory
    SET importance = GREATEST(0.0, LEAST(1.0, importance + p_delta))
    WHERE id = p_id;
  END IF;
END;
$$;
-- AxiomOS Agent Memory — Seed Procedural Memory
-- Global (tenant_id NULL) starter rules for all domains
-- Run AFTER SCHEMA.sql + RLS_POLICY.sql
-- Extend with tenant-specific rules via writeProcedural()

-- ============================================================
-- GENERAL AGENT RULES (domain: general)
-- ============================================================

INSERT INTO procedural_memory (
  tenant_id, domain, procedure_key, name, description,
  content, content_type, priority, version
) VALUES

(NULL, 'general', 'agent_output_format_v1', 'Agent Output Format',
 'Standard output structure all agents must follow',
 $content$
Always structure responses as:
1. Summary — one sentence stating what was accomplished or determined
2. Details — supporting information, data, reasoning
3. Next Step — what the agent or user should do next (if applicable)
4. Flags — any risks, uncertainties, or items requiring human review

Never fabricate data. If information is unavailable, say so explicitly.
Never take irreversible actions without explicit confirmation.
$content$,
 'rule', 90, 1),

(NULL, 'general', 'agent_uncertainty_v1', 'Uncertainty Handling',
 'How agents should handle low-confidence situations',
 $content$
When confidence is below 0.7:
- Clearly state the uncertainty before providing output
- List what additional information would resolve the uncertainty
- Default to the more conservative/cautious action
- Flag for human review if the decision is high-stakes

Never present uncertain conclusions as definitive facts.
$content$,
 'rule', 85, 1),

(NULL, 'general', 'agent_memory_write_v1', 'Memory Write Policy',
 'When and what agents should write to episodic memory',
 $content$
Write to episodic memory after:
- Any tool call (log the call + result summary)
- Any significant decision with its rationale
- Any error or unexpected result
- Any output delivered to the user

Importance scoring:
- 0.9–1.0: errors, critical decisions, irreversible actions
- 0.6–0.8: standard decisions, tool results
- 0.3–0.5: routine observations, low-stakes outputs
- 0.1–0.2: verbose logs, intermediate steps
$content$,
 'rule', 80, 1),

-- ============================================================
-- REAL ESTATE RULES
-- ============================================================

(NULL, 'real_estate', 'real_estate_compliance_v1', 'Real Estate Compliance Rules',
 'Compliance constraints for real estate agent operations',
 $content$
Mandatory compliance rules for real estate domain:
- Never provide specific investment advice or guaranteed returns
- Always disclose when information is based on historical data vs. current market
- Fair Housing: Never filter or rank properties based on protected class characteristics
- Always recommend professional legal/financial review for transactions over $500K
- Zoning analysis must cite source and date — zoning codes change
- Cap rate and ROI calculations must include all assumed inputs in output
$content$,
 'rule', 95, 1),

(NULL, 'real_estate', 'real_estate_data_sources_v1', 'Real Estate Data Source Hierarchy',
 'Preferred data sources in order of reliability',
 $content$
Data source priority for real estate analysis:
1. MLS (direct feed) — current listings, confirmed sales
2. County property appraiser — ownership, assessed value, legal description
3. CoStar / LoopNet — commercial comps
4. Zillow / Redfin — consumer-grade estimates, useful for trends only
5. Census / ACS — demographic and market context
6. Agent-provided data — always note as unverified until confirmed

Never cite Zillow Zestimate as a valuation — only as a market reference point.
$content$,
 'rule', 88, 1),

-- ============================================================
-- CANNABIS FINTECH RULES
-- ============================================================

(NULL, 'cannabis_fintech', 'cannabis_compliance_v1', 'Cannabis Fintech Compliance',
 'Regulatory constraints for cannabis financial operations',
 $content$
Cannabis fintech compliance requirements:
- All financial data must be tagged with state jurisdiction
- Never process or reference transactions in states where cannabis is federally illegal 
  without explicit legal clearance
- BSA/AML: Flag any transaction pattern that triggers SAR reporting thresholds
- Always note that cannabis businesses cannot use standard federal banking — 
  recommend state-chartered or credit union options
- Seed-to-sale tracking integration must reference METRC or state equivalent
- License status must be verified before any financial processing begins
$content$,
 'rule', 98, 1),

-- ============================================================
-- HEALTHCARE RULES
-- ============================================================

(NULL, 'healthcare', 'healthcare_phi_v1', 'Healthcare PHI Handling',
 'Rules for handling protected health information',
 $content$
PHI and HIPAA compliance:
- Never store, log, or pass raw patient identifiers in memory
- De-identify all data before writing to episodic or semantic memory
- Audit log all data access events
- Never output clinical recommendations — defer to licensed practitioners
- Any data transmission must use encrypted channels only
- Minimum necessary standard: only access PHI fields required for the specific task
$content$,
 'rule', 99, 1);

-- ============================================================
-- VERIFY SEED
-- ============================================================

SELECT domain, name, priority, version
FROM procedural_memory
WHERE tenant_id IS NULL
ORDER BY domain, priority DESC;
