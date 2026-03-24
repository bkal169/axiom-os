# AxiomOS — V7 Build Plan
**Compiled:** March 23, 2026
**Status:** Planned — not yet in development
**Author:** Juniper Rose Intelligence LLC

---

## Build Rating

**Overall Score: 8.8 / 10**

| Dimension | Score | Notes |
|---|---|---|
| Strategic coherence | 9.5 | Every feature compounds the others. BYOD feeds the cache. The cache reduces marketplace agent cost. Procore/Yardi feeds BYOD. The autonomous commitment engine sits on top of everything. This is a flywheel, not a feature list. |
| Technical ambition | 9.0 | Semantic caching, sandboxed agent runtime, autonomous DocuSign submission, ARGUS parser, firm-level vector isolation — this is genuinely hard infrastructure. Most CRE SaaS vendors have none of it. |
| Risk calibration | 7.5 | The autonomous commitment engine is the live grenade. The hallucination guardrails are essential but need real legal review before production. BYOD has GDPR/CCPA surface area that isn't fully addressed yet. |
| Sequencing logic | 8.5 | Correct instinct to do cost modeling before marketplace — you don't want to launch a marketplace and immediately get killed by token bills. Hallucination guardrails should ship before autonomous commitments, full stop. |
| Monetization leverage | 9.5 | Marketplace royalty split + BYOD as Enterprise+ lock-in + autonomous engine as Boutique+ gate = three distinct revenue expansion vectors on top of the base subscription ladder. |
| Completeness | 8.0 | Missing: error recovery strategies for the ingestion pipeline at scale, rate limit handling for Procore/Yardi APIs, marketplace agent versioning/deprecation policy, and a rollback plan if autonomous LOI submission misfires. |

**What makes this a strong v7 and not just a roadmap wish list:** every feature has a defined acceptance criteria, a named schema, and specific files to touch. These are executable plans, not product visions.

**The one thing that could derail the whole batch:** shipping autonomous financial commitments before the hallucination guardrails are hardened and independently reviewed by a licensed attorney. The upside of the autonomous engine is real. The downside of a $15M LOI submitted on a hallucinated GNN score is existential.

**Recommended ship order:** Cost Modeling → Hallucination Guardrails → BYOD → Procore/Yardi → Marketplace → Autonomous Commitments (last, gated behind explicit legal sign-off).

---

## Feature Index

1. [True Bundle Splitting — Lazy Loading (Deferred from v6)](#1-true-bundle-splitting--lazy-loading)
2. [Anti-Hallucination Guardrails for Financial Outputs](#2-anti-hallucination-guardrails-for-financial-outputs)
3. [Procore / Yardi Native Sync](#3-procore--yardi-native-sync)
4. [Autonomous Financial Commitments — Auto-LOI Engine](#4-autonomous-financial-commitments--auto-loi-engine)
5. [Bring-Your-Own-Data (BYOD) — Firm-Level Intelligence](#5-bring-your-own-data-byod--firm-level-intelligence)
6. [The Agent Marketplace](#6-the-agent-marketplace)
7. [API Cost Modeling & Semantic Cache Layer](#7-api-cost-modeling--semantic-cache-layer)

---

## 1. True Bundle Splitting / Lazy Loading

> **Priority:** Medium | **Effort:** ~4 hours | **Risk:** Low
> **Blocked by:** Nothing
> **Blocks:** Nothing

### Why the last attempt failed

`App.tsx` lazy-loads components, but `main.tsx` statically imports `AuthProvider` which statically imports Supabase. The entire vendor-supabase bundle (45KB gzip) loads for every marketing visitor regardless of lazy loading in `App.tsx`. Additionally, wrapping `<Routes>` in a single `<Suspense>` caused a blank render in production — a React 18 StrictMode + React Router v6 double-invoke edge case. Reverted in commit `be446ad`.

### The right fix: two entry points

**Phase 1 — Move `AuthProvider` inside the app branch** (~30 min)

Rather than wrapping the whole tree in `main.tsx`, render `AuthProvider` conditionally inside `App.tsx`:

```tsx
// App.tsx
export const App: React.FC = () => {
  if (IS_APP_DOMAIN) {
    return (
      <AuthProvider>          {/* Supabase only loads on app.buildaxiom.dev */}
        <Routes> ... </Routes>
      </AuthProvider>
    );
  }
  return <Routes> ... </Routes>;  // zero Supabase on marketing domain
};
```

Remove `AuthProvider` from `main.tsx`. `DebugErrorBoundary` and `BrowserRouter` stay in `main.tsx`.

**Phase 2 — Add lazy loading correctly** (~1 hour)

With Supabase now isolated, lazy-load app shell components. Do NOT wrap all `<Routes>` in one `<Suspense>` — wrap each `<Route element>` individually:

```tsx
const AxiomModular = lazy(() => import('./jsx/AxiomApp'));
const LoginPage    = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));

<Route path="/login" element={
  <Suspense fallback={<AppSkeleton />}><LoginPage /></Suspense>
} />
<Route element={<AuthGate />}>
  <Route path="/*" element={
    <Suspense fallback={<AppSkeleton />}><AxiomModular /></Suspense>
  } />
</Route>
```

**Phase 3 — Validate with bundle analysis** (~30 min)

```bash
npx vite-bundle-visualizer
```

Confirm:
- `www.buildaxiom.dev` bundle contains zero Supabase, zero chart libraries
- `app.buildaxiom.dev` bundle has full auth + app shell

### Expected outcome

| Metric | Before | After |
|---|---|---|
| Marketing index.js (gzip) | ~87KB | ~8KB |
| vendor-supabase on marketing | 45KB loaded | 0KB |
| vendor-charts on marketing | 88KB loaded | 0KB |

### Files to touch

| File | Change |
|---|---|
| `src/main.tsx` | Remove `AuthProvider` |
| `src/App.tsx` | Add `AuthProvider` inside `IS_APP_DOMAIN` branch; per-route `Suspense` |

### Pre-flight checklist

- [ ] Test on `localhost` — login flow works end-to-end
- [ ] Force `IS_APP_DOMAIN = false` locally — marketing renders without crashing
- [ ] `DebugErrorBoundary` shows error UI (not white screen) when a lazy chunk fails
- [ ] `npm run build` — zero TypeScript errors
- [ ] Smoke test `/privacy`, `/terms`, `/refund` after deploy

---

## 2. Anti-Hallucination Guardrails for Financial Outputs

> **Priority:** Critical | **Effort:** ~2 weeks | **Risk:** High if skipped
> **Blocked by:** Nothing
> **Blocks:** Autonomous Commitments (must ship first)

### The threat model

| Mode | Example | Risk |
|---|---|---|
| Arithmetic hallucination | Agent outputs 8.2% cap rate but embedded NOI/value math yields 5.1% | Underwriter builds a bad stack on the wrong number |
| Range plausibility failure | Agent outputs 47% IRR on a core-plus multifamily deal | Gets presented to LP |
| Cascade error | One hallucinated rent PSF silently propagates through 12 downstream cells | Entire pro-forma is wrong, no single cell looks broken |

### Layer 1 — Deterministic Recalculation Engine

**Never trust the agent's computed outputs. Recompute everything from primitives.**

`backend/axiom_engine/financial_validator.py`:

```python
class FinancialBounds:
    # CRE market-calibrated ranges — update quarterly
    CAP_RATE        = (0.03, 0.12)   # 3%–12%
    IRR_TARGET      = (0.05, 0.35)   # 5%–35%
    EQUITY_MULTIPLE = (1.0, 5.0)     # 1x–5x
    LTV             = (0.30, 0.85)   # 30%–85%
    DSCR            = (0.80, 3.50)   # 0.80–3.50x
    NOI_MARGIN      = (0.30, 0.80)   # 30%–80% of EGI
    RENT_PSF_GROWTH = (-0.05, 0.10)  # -5% to +10% YoY
    EXIT_CAP_SPREAD = (-0.01, 0.03)  # exit cap vs entry cap delta

# Drift thresholds
DRIFT_WARN  = 0.02   # 2% drift → yellow warning
DRIFT_ERROR = 0.05   # 5% drift → red, block display of agent value
DRIFT_BLOCK = 0.15   # 15% drift → hard block, Skeptic auto-invoked
```

**Recalculation cascade:**
```
Agent provides: gross_revenue, vacancy_rate, opex, purchase_price, debt_amount, rate, amort
Python recomputes: EGI → NOI → Cap Rate → DSCR → Cash-on-Cash → IRR (DCF) → EM
Each step checks against FinancialBounds.
If any step is out of bounds → flag with severity.
If agent's claimed value drifts >threshold from recomputed → flag as DRIFT.
```

### Layer 2 — Skeptic Agent Auto-Trigger

Skeptic becomes automatic on `DRIFT_BLOCK` conditions (>15% drift):

```python
def post_underwriting_hook(result):
    validation = financial_validator.validate(result)
    if validation.has_drift_block():
        skeptic_review = skeptic_agent.review(
            original_output=result,
            flagged_fields=validation.blocked_fields,
            prompt_context="Automatic review: validator detected >15% drift."
        )
        result.skeptic_review   = skeptic_review
        result.auto_skeptic_triggered = True
    return result
```

### Layer 3 — UI Enforcement

Three visual states for every financial output cell:

- **VERIFIED** (green lock): Python recomputed value matches agent within 2%. Safe.
- **FLAGGED** (amber ⚠): 2–5% drift. Shows agent value with tooltip noting the variance.
- **BLOCKED** (red 🚫): >5% drift or out-of-bounds. Agent value not shown. Python recomputed value displayed with replacement banner.

**IC Memo / Export guard:** Physically blocks PDF generation until user types `REVIEWED` confirming they have seen all flagged fields.

### Layer 4 — Audit Trail

```sql
CREATE TABLE underwriting_audit (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id              uuid REFERENCES deals(id),
    user_id              uuid REFERENCES auth.users(id),
    run_at               timestamptz DEFAULT now(),
    agent_model          text,
    primitive_inputs     jsonb,
    agent_outputs        jsonb,
    validated_outputs    jsonb,
    drift_report         jsonb,
    blocked_fields       text[],
    skeptic_triggered    boolean DEFAULT false,
    skeptic_output       jsonb,
    user_confirmed_review boolean,
    export_generated     boolean DEFAULT false
);
```

### Layer 5 — Plan-gated validation strictness

| Tier | Max deal size (unverified) | Validation |
|---|---|---|
| Free | $5M | Bounds check only |
| Pro | $25M | Bounds + 5% drift block |
| Pro+ | $100M | Bounds + 2% drift warn + auto-Skeptic |
| Boutique+ | Unlimited | Full cascade + audit trail + export guard |

### Files to create / modify

| File | Action |
|---|---|
| `backend/axiom_engine/financial_validator.py` | **Create** — bounds, recomputation cascade, drift scoring |
| `backend/axiom_engine/agents/skeptic_agent.py` | **Modify** — auto-trigger mode |
| `backend/axiom_engine/agents/agent_pipeline.py` | **Modify** — `post_underwriting_hook` |
| `backend/routers/underwriting.py` | **Modify** — attach `ValidationResult` to every response |
| `supabase/migrations/` | **Add** — `underwriting_audit` table |
| `frontend/src/jsx/components/Underwriting/ValidationBadge.jsx` | **Create** |
| `frontend/src/jsx/components/Underwriting/ExportGuard.jsx` | **Create** |
| `frontend/src/jsx/components/Underwriting/SkepticPanel.jsx` | **Modify** |

### Acceptance criteria

- [ ] Manually injected 20% NOI drift is caught, blocked, agent value never shown
- [ ] Export blocked until user types `REVIEWED` when any BLOCKED field exists
- [ ] Skeptic auto-triggers without user action when drift > 15%
- [ ] All runs write to `underwriting_audit` with full primitive inputs
- [ ] Unit tests cover every `FinancialBounds` range at boundary values
- [ ] End-to-end tested on a real $150M deal shell

---

## 3. Procore / Yardi Native Sync

> **Priority:** High | **Effort:** ~3 weeks | **Risk:** Medium (external API stability)
> **Blocked by:** Nothing
> **Blocks:** Nothing (feeds BYOD corpus once live)

### Architecture

```
AxiomOS (Supabase Edge Functions)
    ├── /webhooks/procore   ← Procore pushes: budget changes, RFIs, change orders, daily logs
    ├── /webhooks/yardi     ← Yardi pushes: rent rolls, vacancies, actuals vs budget
    ├── /sync/procore       ← Axiom pushes: new projects, budgets, milestones
    └── /sync/yardi         ← Axiom pushes: projected rent schedules, lease terms
```

All sync through Supabase Edge Functions. No API keys touch the frontend.

### Procore Integration

**Inbound event types:**

```ts
const PROCORE_EVENTS = {
  "commitment.change_order.created": handleChangeOrder,
  "commitment.invoice.created":      handleInvoiceDraw,
  "schedule.task.updated":           handleMilestoneUpdate,
  "budget.line_item.updated":        handleBudgetVariance,
  "daily_log.general.created":       handleFieldLog,
  "rfis.rfi.created":                handleRFI,
};
```

**Change order cascade:** New CO → recalculate total construction cost → re-run FinancialValidator → if DSCR/LTV breaks threshold → DealAlert in Axiom UI → if Swarm enabled → flag for Swarm review.

**Outbound (Axiom → Procore):** When deal moves Underwriting → Active Construction, push project record, budget line items, milestone schedule, proforma rent comps.

### Yardi Integration

Supports both Voyager SOAP/XML and Breeze/RENTCafé REST:

```ts
const YARDI_EVENT_MAP = {
  "ResidentTransaction": handleCollectionActual,
  "UnitAvailability":    handleVacancyChange,
  "GLTransaction":       handleOpexActual,
  "LeaseExpiration":     handleLeaseAlert,
};
```

**Collection actuals cascade:** Actual collected → compare to proforma → compute variance % → if >5% negative for 2+ consecutive months → update `deal.actual_noi` → trigger `financial_validator.recompute_returns()` → if IRR drops below threshold → alert portfolio manager.

### Schema

```sql
CREATE TABLE integration_credentials (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id       uuid REFERENCES organizations(id),
    platform     text NOT NULL,          -- 'procore' | 'yardi'
    access_token text,                   -- encrypted via Supabase Vault
    refresh_token text,
    token_expiry  timestamptz,
    company_id   text,
    enabled      boolean DEFAULT true
);

CREATE TABLE sync_mappings (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id        uuid REFERENCES deals(id),
    platform       text NOT NULL,
    external_id    text NOT NULL,
    last_synced_at timestamptz,
    sync_status    text DEFAULT 'active',  -- 'active' | 'paused' | 'error'
    error_log      jsonb
);

CREATE TABLE platform_events (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform    text NOT NULL,
    event_type  text NOT NULL,
    payload     jsonb NOT NULL,
    processed   boolean DEFAULT false,
    deal_id     uuid REFERENCES deals(id),
    created_at  timestamptz DEFAULT now()
);

CREATE TABLE property_actuals (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id         uuid REFERENCES deals(id),
    period          date NOT NULL,
    actual_gpi      numeric,
    actual_vacancy  numeric,
    actual_opex     numeric,
    actual_noi      numeric,
    proforma_noi    numeric,
    variance_pct    numeric,
    source          text             -- 'yardi' | 'manual'
);
```

### Plan-gated access

| Tier | Access |
|---|---|
| Free–Pro+ | None |
| Pro+ | Live Yardi webhook sync (1 property) |
| Boutique | Procore + Yardi bidirectional (up to 5 properties) |
| Enterprise+ | Unlimited, custom Voyager SOAP mapping, Procore SSO |

### Files to create / modify

| File | Action |
|---|---|
| `supabase/functions/webhooks-procore/index.ts` | **Create** |
| `supabase/functions/webhooks-yardi/index.ts` | **Create** |
| `supabase/functions/sync-procore/index.ts` | **Create** |
| `supabase/functions/sync-yardi/index.ts` | **Create** |
| `supabase/migrations/` | **Add** — 4 tables above |
| `backend/axiom_engine/integrations/procore_client.py` | **Create** |
| `backend/axiom_engine/integrations/yardi_client.py` | **Create** — SOAP + REST |
| `backend/axiom_engine/financial_validator.py` | **Modify** — `recompute_from_actuals()` |
| `frontend/src/jsx/components/Modules/IntegrationHub.jsx` | **Create** |
| `frontend/src/jsx/components/Deals/LiveDataPanel.jsx` | **Create** |

### Acceptance criteria

- [ ] Procore change order reflects in Axiom deal budget within 60 seconds
- [ ] Yardi collection shortfall >5% for 2 months triggers DealAlert automatically
- [ ] OAuth token refresh handles Procore's 2-hour expiry without user re-auth
- [ ] Yardi SOAP XML tested against Voyager 7S and Breeze response formats
- [ ] Sync failure does not corrupt the Axiom deal record (idempotent writes only)

---

## 4. Autonomous Financial Commitments — Auto-LOI Engine

> **Priority:** High | **Effort:** ~4 weeks | **Risk:** Critical — legal review required before launch
> **Blocked by:** Hallucination Guardrails (must be hardened first)
> **Blocks:** Nothing

### What "autonomous" means precisely

The agent does NOT contact brokers or submit to external parties without a confirmation step at default settings. What it does:

1. Monitors the deal pipeline continuously
2. When GNN score + Swarm consensus cross configured thresholds → drafts a complete LOI
3. Presents draft to user with a time-boxed confirmation window
4. If Lock 3 is armed (explicit opt-in by account owner only) → submits via DocuSign without per-deal confirmation

### The three locks

```
Lock 1: GNN Score Threshold     → quantitative, configured per portfolio
Lock 2: Swarm Consensus Gate    → qualitative, multi-agent agreement required
Lock 3: Human Confirmation      → default ON, opt-out requires account owner arming
```

All three must pass. Lock 3 can only be disabled by the **account owner** (not admins). Its arm/disarm state is logged immutably.

### Decision pipeline

```
Every 15 minutes: scan deals in "Active Underwriting"
    ├── GNN score ≥ threshold?              NO → skip
    ├── Swarm consensus ≥ threshold?        NO → skip, log reason
    ├── Financial validator: all GREEN?     NO → block, alert user
    ├── Within max offer price?             NO → block, alert user
    ├── Under max active commitments?       NO → queue, alert user
    ├── Draft LOI (DocuSign template)
    ├── Lock 3 ARMED?
    │   ├── NO  → send confirmation request (time-boxed window)
    │   │         if no response → expire draft, log
    │   └── YES → submit immediately → log → alert user post-submission
    └── Write full record to autonomous_commitments audit table
```

### LOI Draft Engine

**Critical rule: The LOI agent writes prose. Python writes every number.**

```python
class LOIAgent:
    REQUIRED_FIELDS = [
        "purchase_price", "earnest_money_deposit", "due_diligence_period",
        "closing_period", "financing_contingency", "seller_name",
        "buyer_entity", "property_address", "legal_description",
        "title_company", "broker_contact"
    ]

    def draft(self, deal, governance) -> LOIDraft:
        # 1. Validate all required fields exist and are within bounds
        # 2. Pull jurisdiction-specific LOI template (FL, TX, NY, CA...)
        # 3. Claude generates prose sections (conditions, representations)
        # 4. Python hard-codes all financial figures — no LLM-generated numbers
        # 5. FinancialValidator runs on the draft output
        # 6. Return LOIDraft with validation_result attached
```

### Portfolio Governance settings UI

```
AUTONOMOUS COMMITMENT ENGINE
──────────────────────────────────────────────────────
[ ] Enable autonomous LOI drafting
[ ] Enable autonomous LOI submission (requires Lock 3 waiver)

GNN Score Threshold          [  82  ] / 100
Swarm Consensus Threshold    [  4/5 ] agents must agree
Max Offer Price              [ $___,___,___ ]
Max Active Commitments       [  3  ]
Commitment Type              [ ● LOI  ○ Hard Offer  ○ Both ]
Offer Expiry Window          [  72  ] hours

AUTO-SUBMISSION (Lock 3 waiver)
──────────────────────────────────────────────────────
[ ] I understand this enables binding financial commitments
    without per-deal human confirmation.
    Account owner signature required.

    [ Sign & Arm ]   Current status: DISARMED
```

### Kill switch

Accessible from Portfolio Governance, deal detail page, and a standalone `/emergency-stop` route (bookmarkable):

```ts
async function emergencyStop(org_id, user_id) {
  // 1. Set governance.autonomous_enabled = false
  // 2. Void all unsigned DocuSign envelopes in flight
  // 3. Cancel all pending confirmation windows
  // 4. Write EMERGENCY_STOP event to audit log
  // 5. Email account owner confirmation
}
```

### Audit schema

```sql
CREATE TABLE autonomous_commitments (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id               uuid REFERENCES deals(id),
    org_id                uuid REFERENCES organizations(id),
    triggered_by          text DEFAULT 'autonomous',
    commitment_type       text,            -- 'loi' | 'hard_offer'
    gnn_score             numeric,
    swarm_consensus       jsonb,
    validation_result     jsonb,
    governance_snapshot   jsonb,           -- exact config at trigger time
    loi_draft             jsonb,
    loi_pdf_url           text,
    lock3_armed           boolean,
    user_confirmed        boolean,
    user_confirmed_at     timestamptz,
    submitted_at          timestamptz,
    docusign_envelope_id  text,
    status  text DEFAULT 'draft',
    -- 'draft'|'pending_confirmation'|'submitted'|'expired'|'withdrawn'|'executed'
    stopped_by_user_id    uuid,
    stopped_at            timestamptz,
    stop_reason           text,
    created_at            timestamptz DEFAULT now()
);

CREATE TABLE commitment_audit_log (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id uuid REFERENCES autonomous_commitments(id),
    event         text NOT NULL,
    actor         text,   -- user_id or 'system' or 'autonomous_agent'
    metadata      jsonb,
    created_at    timestamptz DEFAULT now()
);
```

### Files to create / modify

| File | Action |
|---|---|
| `backend/axiom_engine/agents/loi_agent.py` | **Create** |
| `backend/axiom_engine/agents/commitment_engine.py` | **Create** — scheduler + decision pipeline |
| `backend/axiom_engine/financial_validator.py` | **Modify** — LOI validation pass |
| `supabase/functions/submit-loi/index.ts` | **Create** — DocuSign envelope creation |
| `supabase/functions/commitment-webhook/index.ts` | **Create** — DocuSign status callbacks |
| `supabase/migrations/` | **Add** — `autonomous_commitments`, `commitment_audit_log` |
| `frontend/src/jsx/components/Modules/PortfolioGovernance.jsx` | **Modify** — ACE settings |
| `frontend/src/jsx/components/Autonomous/CommitmentDashboard.jsx` | **Create** |
| `frontend/src/jsx/components/Autonomous/LOIConfirmationModal.jsx` | **Create** |
| `frontend/src/jsx/components/Autonomous/KillSwitch.jsx` | **Create** |
| `frontend/src/pages/EmergencyStop.tsx` | **Create** |

### Acceptance criteria

- [ ] Lock 3 can only be armed by account owner — not admin role users
- [ ] Kill switch voids live DocuSign envelopes within 30 seconds
- [ ] LOI financial figures are 100% from Python — LLM never writes a dollar amount
- [ ] Every state transition writes to `commitment_audit_log` without gaps
- [ ] Full-auto submission tested end-to-end in DocuSign sandbox before any production arming
- [ ] Confirmation modal is non-dismissable (no ESC, no click-outside) for deals above $10M
- [ ] **LOI template reviewed by a licensed Florida real estate attorney before launch**

---

## 5. Bring-Your-Own-Data (BYOD) — Firm-Level Intelligence

> **Priority:** High | **Effort:** ~3 weeks | **Risk:** Medium (data privacy surface area)
> **Blocked by:** Nothing
> **Blocks:** Nothing (enhances all agents once live)

### Architecture

```
Enterprise Data Lake (S3 / SharePoint / Box / direct upload)
        ↓
Ingestion Pipeline (Railway async worker)
    parse → classify → extract entities → chunk → embed → tag
        ↓
Private Vector Store (pgvector, RLS-isolated per org_id)
        ↓
Firm Memory Layer (retrieval-augmented context injection)
        ↓
All Axiom Agents — grounded in the firm's own deal history
```

Every org's vectors are hard-isolated by RLS. No cross-contamination between firms.

### Supported ingestion formats

| Format | Parser | Value |
|---|---|---|
| `.xlsx` | ExcelParser | Underwriting models, rent rolls, budgets |
| `.csv` | CSVParser | Bulk deal exports, CoStar pulls |
| `.pdf` | PDFParser | IC memos, appraisals, loan docs, term sheets |
| `.docx` | DocxParser | LOIs, legal agreements, investment memos |
| `.pptx` | PPTXParser | IC presentations, LP decks |
| `.mbox` / `.eml` | EmailParser | Broker correspondence, deal flow |
| `.aee` | ArgusConnector | ARGUS Enterprise DCF — highest-value vectors in any institutional corpus |
| Procore | ProcoreConnector | Live construction data (Phase 2 — after Procore sync ships) |
| Yardi | YardiConnector | Live property actuals (Phase 2 — after Yardi sync ships) |

### Ingestion pipeline

```python
class IngestionPipeline:
    async def process(self, upload: DataUpload) -> IngestionResult:
        raw      = await self.parse(upload)
        doc_type = await self.classifier.classify(raw)
        # → "ic_memo"|"rent_roll"|"appraisal"|"loan_agreement"
        #   "underwriting_model"|"broker_email"|"market_report"

        entities = await self.entity_extractor.extract(raw, doc_type)
        # → deal_name, address, asset_class, vintage, purchase_price,
        #   exit_price, hold_period, irr_actual, em_actual,
        #   key_risks, decision_rationale, outcome (sold/held/defaulted)

        chunks     = self.chunker.chunk(raw, strategy=doc_type)
        embeddings = await self.embedder.embed(chunks)  # deduped via exact cache

        await self.vector_store.upsert(
            org_id=upload.org_id,
            doc_id=upload.id,
            chunks=chunks,
            embeddings=embeddings,
            metadata=entities
        )
```

### Firm Memory Layer

```python
class FirmMemoryRetriever:
    async def retrieve(self, org_id: str, query: str, k: int = 8) -> FirmContext:
        embedding = await get_embedding(query)

        results = await db.execute("""
            SELECT chunk_text, doc_type, deal_name, market,
                   irr_actual, em_actual, outcome, metadata,
                   1 - (embedding <=> $1) AS similarity
            FROM firm_memory_vectors
            WHERE org_id = $2 AND similarity > 0.72
            ORDER BY similarity DESC LIMIT $3
        """, embedding, org_id, k)

        return FirmContext(chunks=results)
```

In-product citation format when firm memory is used:
> *"Based on your firm's 12 comparable garden-style multifamily acquisitions in Atlanta (2018–2024), your average going-in cap rate was 4.8%. This deal's 4.2% entry is 60bps tighter — consistent with your tightest historical entry (Peachtree Commons, 2021, 4.1%, 2.1x EM)."*

### Schema

```sql
CREATE TABLE firm_memory_vectors (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id       uuid REFERENCES organizations(id) NOT NULL,
    doc_id       uuid REFERENCES byod_documents(id),
    chunk_index  int,
    chunk_text   text,
    embedding    vector(3072),
    doc_type     text,
    deal_name    text,
    asset_class  text,
    market       text,
    vintage_year int,
    outcome      text,   -- 'sold'|'held'|'defaulted'|'refi'
    irr_actual   numeric,
    em_actual    numeric,
    metadata     jsonb,
    created_at   timestamptz DEFAULT now()
);

CREATE INDEX ON firm_memory_vectors
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE firm_intelligence_profile (
    org_id           uuid PRIMARY KEY REFERENCES organizations(id),
    total_docs       int DEFAULT 0,
    deal_count       int DEFAULT 0,
    asset_class_mix  jsonb,
    avg_hold_period  numeric,
    avg_irr_actual   numeric,
    avg_em_actual    numeric,
    top_markets      text[],
    risk_profile     text,   -- 'conservative'|'moderate'|'aggressive'
    last_updated     timestamptz
);
```

### Privacy & Security

- **Encryption:** AES-256 at rest, TLS 1.3 in transit. Enterprise+: BYOK via customer KMS key
- **Isolation:** RLS on `firm_memory_vectors`: `org_id = auth.jwt()->>'org_id'`
- **Global model:** BYOD vectors are **never** used to improve Axiom's base model
- **Deletion:** Full corpus wipe within 60 seconds from settings; all vectors purged within 24 hours of account termination

### Plan-gated access

| Tier | BYOD Access |
|---|---|
| Free–Pro+ | None |
| Boutique | Up to 500 documents, 3 asset classes |
| Enterprise | Up to 5,000 documents, all asset classes, ARGUS connector |
| Enterprise+ | Unlimited, BYOK encryption, dedicated ingestion worker, SLA |

### Files to create / modify

| File | Action |
|---|---|
| `backend/axiom_engine/byod/ingestion_worker.py` | **Create** |
| `backend/axiom_engine/byod/parsers/` | **Create** — PDF, XLSX, DOCX, PPTX, email, ARGUS |
| `backend/axiom_engine/byod/entity_extractor.py` | **Create** |
| `backend/axiom_engine/agents/firm_memory.py` | **Create** |
| `backend/axiom_engine/agents/base_agent.py` | **Modify** — inject FirmMemoryRetriever |
| `supabase/migrations/` | **Add** — `firm_memory_vectors`, `byod_documents`, `firm_intelligence_profile` |
| `frontend/src/jsx/components/Modules/FirmIntelligence.jsx` | **Create** |
| `frontend/src/jsx/components/BYOD/CorpusUploader.jsx` | **Create** |
| `frontend/src/jsx/components/BYOD/IngestionProgress.jsx` | **Create** |

### Acceptance criteria

- [ ] 2015 PDF IC memo correctly extracts deal name, vintage, IRR, EM, and outcome
- [ ] ARGUS `.aee` parser produces correct rent roll + reversion cap from a known deal
- [ ] Firm memory retrieval never returns vectors from a different org (RLS tested with two live orgs)
- [ ] Full corpus wipe completes within 60 seconds with zero residual vectors
- [ ] Agent citation names a specific comparable deal when similarity > 0.85
- [ ] Ingestion worker handles a 10,000-document upload without memory crash

---

## 6. The Agent Marketplace

> **Priority:** Medium-High | **Effort:** ~5 weeks | **Risk:** Medium (developer ecosystem cold-start)
> **Blocked by:** API Cost Modeling (needed before marketplace billing can be profitable)
> **Blocks:** Nothing

### Marketplace taxonomy

```
JURISDICTION SPECIALISTS
  Miami Zoning & Entitlement Agent
  NYC Landmarks & Airspace Agent
  California CEQA Compliance Agent
  Texas Property Tax Protest Agent

ASSET CLASS SPECIALISTS
  LIHTC (Low-Income Housing Tax Credit) Specialist
  Opportunity Zone Structuring Agent
  NNN Ground Lease Underwriting Agent
  Data Center / Industrial Cold Shell Agent

FINANCIAL SPECIALISTS
  EB-5 Capital Stack Agent
  HUD/FHA 221(d)(4) Underwriting Agent
  CMBS Defeasance Calculator Agent
  Preferred Equity Waterfall Modeler

DATA CONNECTORS
  CoStar Deep Pull Agent
  RealPage Rent Analytics Agent
  Trepp CMBS Monitor Agent
```

### Developer SDK

Published as `pip install axiom-agent-sdk`:

```python
from axiom_agent_sdk import AxiomAgent, AgentContext, AgentResponse

class MiamiZoningAgent(AxiomAgent):
    MANIFEST = {
        "id":       "miami-zoning-specialist",
        "name":     "Miami-Dade Zoning & Entitlement Specialist",
        "version":  "2.1.0",
        "price":    {"model": "per_run", "amount": 0.75},
        "tier_min": "pro",
        "tags":     ["zoning", "miami", "multifamily", "entitlement"],
    }

    REQUIRED_CONTEXT = ["address", "zoning_code", "parcel_id", "asset_class"]

    OUTPUT_SCHEMA = {
        "permitted_uses":     list,
        "max_height_ft":      float,
        "max_far":            float,
        "setbacks":           dict,
        "entitlement_path":   str,
        "estimated_timeline": str,
        "risk_flags":         list,
        "confidence":         float,
    }

    async def run(self, ctx: AgentContext) -> AgentResponse:
        # ctx provides: deal data, LLM client, web search, FinancialValidator
        # Sandbox prevents: filesystem, unapproved outbound HTTP, cross-org data
        ...
```

### Sandboxed execution runtime

```python
class AgentSandbox:
    ALLOWED_OUTBOUND_DOMAINS = []   # from agent's declared manifest only
    MAX_EXECUTION_TIME_SEC   = 120
    MAX_LLM_TOKENS           = 32_000
    MAX_MEMORY_MB            = 512
    FILESYSTEM_ACCESS        = False
    CROSS_DEAL_DATA_ACCESS   = False
    DATABASE_WRITE_SCOPE     = "output_schema_only"
```

### Billing & royalty engine

```
User runs marketplace agent → Axiom charges Stripe → 30% Axiom / 70% Developer
Developer receives payout via Stripe Connect on the 1st of each month
```

Price models: `per_run` | `per_month` | `per_seat`

### Review & approval pipeline

```
Developer submits
    ├── Automated (immediate): manifest valid, no secrets, sandbox test, no number outputs bypassing validator
    ├── Security scan (5 min): data exfiltration patterns, prompt injection resistance
    └── Human review (1-3 business days): domain expertise, 5 deal fixtures, legal licensure check
        ├── Approve → "Axiom Verified" badge
        └── Reject → detailed feedback
```

**Verified badge tiers:**
- ✓ **Axiom Verified** — passed automated + human review
- ✓ **Expert Verified** — additionally reviewed by a licensed CRE professional
- ✓ **Axiom Staff Pick** — curated by Axiom team as best-in-class

### Schema (abbreviated)

```sql
CREATE TABLE marketplace_developers (id, user_id, company_name, stripe_connect_account_id, connect_status, approved);
CREATE TABLE marketplace_agents (id, developer_id, agent_id_slug, name, price_model, price_cents, tier_minimum, status, verified, install_count, avg_rating);
CREATE TABLE marketplace_installs (id, org_id, agent_id, installed_by, enabled);
CREATE TABLE marketplace_runs (id, agent_id, org_id, user_id, deal_id, duration_ms, status, output, tokens_used);
CREATE TABLE marketplace_transactions (id, run_id, gross_amount, axiom_revenue, developer_payout, stripe_charge_id, stripe_transfer_id);
CREATE TABLE marketplace_reviews (id, agent_id, user_id, rating, review_text, verified_purchase);
```

### Files to create / modify

| File | Action |
|---|---|
| `axiom-agent-sdk/` | **Create** — pip package (separate repo) |
| `backend/axiom_engine/marketplace/sandbox.py` | **Create** |
| `backend/axiom_engine/marketplace/billing.py` | **Create** — Stripe Connect |
| `backend/axiom_engine/marketplace/registry.py` | **Create** |
| `backend/axiom_engine/marketplace/review_pipeline.py` | **Create** |
| `backend/routers/marketplace.py` | **Create** |
| `supabase/migrations/` | **Add** — 6 marketplace tables |
| `frontend/src/jsx/components/Modules/Marketplace.jsx` | **Create** |
| `frontend/src/jsx/components/Marketplace/AgentCard.jsx` | **Create** |
| `frontend/src/jsx/components/Marketplace/DeveloperPortal.jsx` | **Create** |
| `frontend/src/jsx/components/Marketplace/AgentRunButton.jsx` | **Create** |

### Acceptance criteria

- [ ] Sandbox blocks filesystem access and unapproved outbound HTTP
- [ ] Developer receives 70% payout in Stripe Connect within 48 hours of month close
- [ ] 3 sandbox violations = developer suspension (logged and enforced)
- [ ] Output schema type mismatch caught at runtime — agent cannot write wrong types
- [ ] Review pipeline catches prompt injection attempts in agent code
- [ ] Marketplace agent cannot read deal data from a different org

---

## 7. API Cost Modeling & Semantic Cache Layer

> **Priority:** High | **Effort:** ~2 weeks | **Risk:** Low
> **Blocked by:** Nothing
> **Blocks:** Agent Marketplace (should ship before marketplace to control token costs at scale)

### The five cost centers

| Cost Center | Est. % of API Spend | Cache-able? |
|---|---|---|
| Embedding generation | ~18% | Yes — exact + semantic |
| Vector retrieval (pgvector) | ~8% | Yes — query result cache |
| LLM completions (agents) | ~54% | Yes — semantic + TTL |
| LLM completions (Copilot) | ~15% | Partial — user-specific |
| BYOD ingestion | ~5% | Yes — document dedup |
| **Total cacheable target** | **~85%** | |
| **Realistic cache hit rate** | **40–60%** | |

### Three-layer cache architecture

```
Request enters
    ├── Layer 1: EXACT CACHE (Redis, 0ms)
    │   hash(request_params) → stored response
    │   Hit rate: ~15%  |  TTL: 7 days (embeddings), 1 hour (agent runs)
    │
    ├── Layer 2: SEMANTIC CACHE (pgvector similarity, ~5ms)
    │   embed(query) → find cached response with cosine sim > 0.96
    │   Hit rate: ~30%  |  TTL: 24 hours
    │
    ├── Layer 3: FIRM-LEVEL CACHE (org-scoped result reuse, ~10ms)
    │   Same query from different users in same org → shared result
    │   Hit rate: ~15%  |  TTL: 4 hours
    │
    └── MISS → Live API call → write all three layers → return
```

### Semantic cache

```python
SIMILARITY_THRESHOLD = 0.96   # nearly identical meaning, not just topic

# Context hash prevents Deal A's cached response from serving Deal B
def build_context_hash(deal: Deal) -> str:
    relevant = {
        "deal_id": deal.id, "purchase_price": deal.purchase_price,
        "noi": deal.noi, "asset_class": deal.asset_class,
        "market": deal.market, "updated_at": deal.updated_at.isoformat()
    }
    return hashlib.sha256(json.dumps(relevant, sort_keys=True).encode()).hexdigest()
```

### Anthropic prompt caching integration

```python
# System prompt (~2000 tokens) + firm context declared as cacheable blocks
# → 90% discount on Anthropic's input token pricing for repeated content
system = [
    {"type": "text", "text": AXIOM_BASE_SYSTEM_PROMPT,
     "cache_control": {"type": "ephemeral"}},
    {"type": "text", "text": firm_context,
     "cache_control": {"type": "ephemeral"}},
]
```

At 1,000 agent runs/day, caching the base system prompt saves ~1.8M tokens/day at the Anthropic layer before Axiom's semantic cache runs.

### Budget guardrails

```python
class BudgetGuard:
    # soft_limit_pct (default 80%) → warn in UI
    # hard_limit_pct (default 100%) → block all live calls
    # Cache hits bypass the hard limit — they are always served
```

### Cache warming (nightly cron)

1. Pre-run Skeptic agent on all `active_underwriting` deals where cache is stale
2. Pre-embed all BYOD documents uploaded in the last 24 hours
3. Pre-compute answers for common market data queries across top markets

### Cost ledger schema

```sql
CREATE TABLE api_cost_ledger (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          uuid REFERENCES organizations(id),
    user_id         uuid REFERENCES auth.users(id),
    deal_id         uuid REFERENCES deals(id),
    agent_type      text,
    model           text,
    tokens_input    int,
    tokens_output   int,
    tokens_cached   int,       -- Anthropic native cache hit tokens
    cost_usd        numeric(10,6),
    cache_layer     text,      -- 'exact'|'semantic'|'firm'|'miss'
    tokens_saved    int,
    cost_saved_usd  numeric(10,6),
    latency_ms      int,
    created_at      timestamptz DEFAULT now()
);

CREATE TABLE semantic_cache_entries (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text      text NOT NULL,
    query_embedding vector(3072) NOT NULL,
    response        jsonb NOT NULL,
    context_hash    text NOT NULL,
    request_type    text NOT NULL,
    org_id          uuid,
    tokens_saved    int,
    hit_count       int DEFAULT 0,
    expires_at      timestamptz NOT NULL
);

CREATE INDEX ON semantic_cache_entries
    USING ivfflat (query_embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE org_api_budgets (
    org_id              uuid PRIMARY KEY REFERENCES organizations(id),
    monthly_budget_usd  numeric,
    soft_limit_pct      numeric DEFAULT 0.80,
    hard_limit_pct      numeric DEFAULT 1.00,
    current_month_spend numeric DEFAULT 0,
    alert_sent_soft     boolean DEFAULT false,
    alert_sent_hard     boolean DEFAULT false
);
```

### Files to create / modify

| File | Action |
|---|---|
| `backend/axiom_engine/cache/exact_cache.py` | **Create** — Redis layer |
| `backend/axiom_engine/cache/semantic_cache.py` | **Create** — pgvector layer |
| `backend/axiom_engine/cache/budget_guard.py` | **Create** |
| `backend/axiom_engine/cache/warmer.py` | **Create** — nightly cron |
| `backend/axiom_engine/cache/ledger.py` | **Create** — cost recording |
| `backend/axiom_engine/llm/anthropic_client.py` | **Modify** — `cache_control` blocks |
| `backend/axiom_engine/agents/base_agent.py` | **Modify** — wrap all agent calls with 3-layer check |
| `backend/axiom_engine/byod/ingestion_worker.py` | **Modify** — embedding dedup |
| `supabase/migrations/` | **Add** — `semantic_cache_entries`, `api_cost_ledger`, `org_api_budgets` |
| `frontend/src/jsx/components/Modules/CostIntelligence.jsx` | **Create** — dashboard |
| `frontend/src/jsx/components/Cost/BudgetMeter.jsx` | **Create** |
| `frontend/src/jsx/components/Cost/CacheStats.jsx` | **Create** |

### Acceptance criteria

- [ ] Same embedding requested twice: second call returns from Redis in <2ms, zero API tokens consumed
- [ ] Semantically equivalent queries (same meaning, different wording) resolve to same cache entry at sim > 0.96
- [ ] Org at 100% budget cannot trigger a live LLM call — cache hits still served
- [ ] Cache entries for Deal A are never served for Deal B (context hash collision test)
- [ ] Nightly warmer pre-populates Skeptic cache for all active-underwriting deals before 6 AM ET
- [ ] Cost dashboard reconciles: `actual_cost + cost_saved = total_theoretical_cost` within $0.01
- [ ] Anthropic `cache_read_input_tokens` logged at 10% cost, not 100%

---

## Recommended Ship Order

```
Week 1–2:   API Cost Modeling & Cache Layer       ← operational necessity first
Week 3–4:   Hallucination Guardrails              ← required before any autonomous features
Week 5–7:   BYOD Ingestion Pipeline               ← enterprise stickiness
Week 8–10:  Procore / Yardi Sync                  ← field data loop
Week 11–15: Agent Marketplace                     ← requires cost layer + stable runtime
Week 16+:   Autonomous Commitments                ← last, after legal review is complete
Ongoing:    Bundle Splitting                      ← low priority, can slot anywhere
```

---

*AxiomOS V7 Build Plan — Juniper Rose Intelligence LLC — Confidential*
