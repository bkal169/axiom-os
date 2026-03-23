# Axiom OS V5 — Deploy Runbook

## Architecture
- **Frontend**: Vite/React → Vercel (auto-deploy on push to main)
- **Backend**: FastAPI/uvicorn → Railway
- **Database**: Supabase (PostgreSQL + Realtime + pgvector)

## Local Development

### Prerequisites
- Node.js 20+
- Python 3.12+
- Supabase CLI

### Start Frontend (port 8008)
```bash
cd frontend
npm install
npm run dev
```

### Start Backend (port 8000)
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in values.

Frontend env vars set in Vercel dashboard:
- `VITE_BACKEND_URL` — Railway backend URL

## Database Migrations

### Apply migrations
```bash
supabase db push
```

### Migration order
1. `20260318000001_v5_core.sql` — Core v5 tables
2. `20260318000002_v5_neural.sql` — Neural layer
3. `20260318000003_v5_governance.sql` — Portfolio governance
4. `20260318000004_v5_tax_layer.sql` — Tax intelligence + OZ RPC
5. `20260319000001_v5_governance_risk.sql` — Risk events
6. `20260319000002_v5_agent_tables.sql` — Agent pipeline + semantic memory

## Production Deploy

### Backend → Railway
```bash
cd backend
railway up
```

### Frontend → Vercel
Push to main branch. Vercel auto-deploys.

Set environment variables in Vercel dashboard:
- `VITE_BACKEND_URL=https://your-railway-app.railway.app`

## Smoke Tests
```bash
python backend/smoke_test.py https://your-railway-app.railway.app
```

## V5 Features
| Feature | Frontend | Backend | DB |
|---------|----------|---------|-----|
| Agent Pipeline | ✅ AgentHandoff + SwarmEngine | ✅ /agents/* | ✅ v5_events, deal_analyses |
| Risk Calibration | ✅ RiskCalibrationDashboard | ✅ /risk/* | ✅ risk_events |
| Tax Intelligence | ✅ TaxIntelPanel | ✅ /tax/* | ✅ opportunity_zones |
| Portfolio Gov | ✅ PortfolioGovernance | ✅ /parcels/* | ✅ portfolio_governance |
| Semantic Memory | — | ✅ /semantic/* | ✅ semantic_memory |
| 3D Site Map | ✅ SiteMap3D (canvas) | — | — |
