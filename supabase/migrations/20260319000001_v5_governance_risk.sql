-- V5 Portfolio Governance and Risk Events tables

-- Portfolio governance tracking
CREATE TABLE IF NOT EXISTS portfolio_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  governance_type TEXT NOT NULL, -- 'concentration_limit', 'diversification', 'waterfall', 'pref_return'
  threshold_value FLOAT,
  current_value FLOAT,
  status TEXT DEFAULT 'compliant', -- 'compliant', 'warning', 'breach'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_governance_org ON portfolio_governance(org_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_governance_deal ON portfolio_governance(deal_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_governance_status ON portfolio_governance(status);

-- Risk events for calibration tracking
CREATE TABLE IF NOT EXISTS risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID,
  risk_type TEXT NOT NULL, -- 'market', 'credit', 'liquidity', 'operational', 'regulatory'
  predicted_prob FLOAT NOT NULL CHECK (predicted_prob >= 0 AND predicted_prob <= 1),
  actual_outcome BOOLEAN,
  brier_score FLOAT,
  tts_applied BOOLEAN DEFAULT FALSE,
  tts_factor FLOAT,
  model_version TEXT DEFAULT 'v5',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_risk_events_org ON risk_events(org_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_type ON risk_events(risk_type);
CREATE INDEX IF NOT EXISTS idx_risk_events_brier ON risk_events(brier_score) WHERE brier_score IS NOT NULL;

-- Enable RLS
ALTER TABLE portfolio_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_governance" ON portfolio_governance
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org_isolation_risk_events" ON risk_events
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_governance_updated_at
  BEFORE UPDATE ON portfolio_governance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
