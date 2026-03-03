// Migration runner — Deno postgres driver + SUPABASE_DB_URL
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

Deno.serve(async (_req) => {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
        return new Response(JSON.stringify({ error: "SUPABASE_DB_URL not available" }), { status: 500 });
    }

    const sql = postgres(dbUrl, { max: 1, idle_timeout: 20, connect_timeout: 10 });
    const results: { stmt: string; status: string; error?: string }[] = [];

    // Run each DDL statement explicitly
    const ddl = [
        `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

        `CREATE TABLE IF NOT EXISTS signals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      domain TEXT NOT NULL,
      region TEXT, asset_type TEXT,
      source_type TEXT NOT NULL, source_name TEXT NOT NULL,
      source_url TEXT, title TEXT, summary TEXT,
      raw_payload JSONB, direction TEXT, strength NUMERIC,
      horizon_months INT, tags TEXT[])`,

        `CREATE TABLE IF NOT EXISTS predictive_economy_baselines (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      region TEXT NOT NULL, asset_type TEXT NOT NULL,
      signals_window JSONB, labor_cost_index NUMERIC,
      materials_cost_index NUMERIC, materials_equity_link JSONB,
      labor_forecast JSONB, materials_forecast JSONB,
      UNIQUE (region, asset_type))`,

        `CREATE TABLE IF NOT EXISTS scenarios (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL, kind TEXT NOT NULL,
      baseline_id UUID REFERENCES predictive_economy_baselines(id),
      horizon_months INT NOT NULL,
      labor_index NUMERIC, materials_index NUMERIC,
      rate_delta_bps INT, rent_growth_delta_pct NUMERIC, outputs JSONB)`,

        `CREATE TABLE IF NOT EXISTS decision_artifacts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      scenario_id UUID REFERENCES scenarios(id),
      project_state JSONB NOT NULL,
      risk_snapshot JSONB, finance_snapshot JSONB,
      scoring_snapshot JSONB, economy_snapshot JSONB, memo_url TEXT)`,

        `CREATE TABLE IF NOT EXISTS tenant_settings (
      tenant_id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      target_irr NUMERIC DEFAULT 18.0,
      min_dscr NUMERIC DEFAULT 1.25,
      max_ltv NUMERIC DEFAULT 0.75,
      risk_tolerance TEXT DEFAULT 'moderate',
      mfa_required BOOLEAN DEFAULT TRUE,
      enable_predictive_economy BOOLEAN DEFAULT TRUE,
      enable_news_signals BOOLEAN DEFAULT TRUE,
      enable_ml_scoring BOOLEAN DEFAULT FALSE)`,

        `CREATE TABLE IF NOT EXISTS security_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      tenant_id UUID, user_id UUID,
      event_type TEXT NOT NULL,
      ip_address INET, user_agent TEXT, metadata JSONB)`,

        `CREATE TABLE IF NOT EXISTS risk_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      tenant_id UUID,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      engine_version TEXT DEFAULT 'v0',
      inputs JSONB NOT NULL, output JSONB NOT NULL)`,

        `CREATE TABLE IF NOT EXISTS scoring_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      tenant_id UUID,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      model_name TEXT NOT NULL, model_version TEXT NOT NULL,
      inputs JSONB NOT NULL, output JSONB NOT NULL)`,

        `CREATE TABLE IF NOT EXISTS models (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      name TEXT NOT NULL, version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'staging',
      metrics JSONB, params JSONB,
      deployed_at TIMESTAMPTZ, retired_at TIMESTAMPTZ)`,

        `CREATE TABLE IF NOT EXISTS model_alerts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      model_name TEXT NOT NULL, model_version TEXT NOT NULL,
      alert_type TEXT NOT NULL, severity TEXT NOT NULL,
      message TEXT NOT NULL, details JSONB)`,

        // Indexes (best-effort)
        `CREATE INDEX IF NOT EXISTS idx_signals_domain_time ON signals (domain, created_at DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_signals_region_asset ON signals (region, asset_type)`,
        `CREATE INDEX IF NOT EXISTS idx_pred_econ_region ON predictive_economy_baselines (region, asset_type)`,
        `CREATE INDEX IF NOT EXISTS idx_scenarios_project ON scenarios (project_id)`,
        `CREATE INDEX IF NOT EXISTS idx_decisions_project ON decision_artifacts (project_id, created_at DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_sec_events_tenant ON security_events (tenant_id, created_at DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_risk_events_proj ON risk_events (project_id, created_at DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_scoring_events_proj ON scoring_events (project_id, created_at DESC)`,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_models_name_ver ON models (name, version)`,
        `CREATE INDEX IF NOT EXISTS idx_model_alerts_model ON model_alerts (model_name, created_at DESC)`,
    ];

    for (const stmt of ddl) {
        const label = stmt.replace(/\s+/g, " ").slice(0, 60);
        try {
            await sql.unsafe(stmt);
            results.push({ stmt: label, status: "ok" });
        } catch (err: any) {
            const msg: string = err.message ?? String(err);
            results.push({ stmt: label, status: msg.includes("already exists") ? "exists" : "ERROR", error: msg });
        }
    }

    await sql.end();

    const ok = results.filter(r => r.status === "ok").length;
    const errors = results.filter(r => r.status === "ERROR");

    return new Response(JSON.stringify({
        success: errors.length === 0,
        summary: `${ok} created, ${results.filter(r => r.status === "exists").length} already_exists, ${errors.length} errors`,
        errors: errors.map(e => ({ stmt: e.stmt, error: e.error })),
        all: results,
    }, null, 2), { headers: { "Content-Type": "application/json" } });
});
