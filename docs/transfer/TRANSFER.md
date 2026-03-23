# AXIOM OS V5 — COMPLETE BUILD TRANSFER
**For Claude Code | All new files from this build session**
*Repo: `Axiom-by-juniper-rose/axiom-os` | Branch: `main`*
*Date: 2026-03-22*

---

## HOW TO USE THIS FILE IN CLAUDE CODE

Open Claude Code in the repo root:
```bash
cd C:\Users\bkala\.gemini\antigravity\scratch\axiom
claude
```

Then say: **"Read TRANSFER.md and write all files to disk exactly as shown"**

Claude Code will create every file in the correct location. After it finishes, run:
```bash
git add -A && git commit -m "feat(v5): neural layer, tax intelligence, agent pipeline refactor" && git push origin main
cd frontend && vercel --prod
```

---

## FILE INDEX

### Backend (new modules)
1. `backend/axiom_engine/neural/__init__.py`
2. `backend/axiom_engine/neural/gnn_risk.py`
3. `backend/axiom_engine/neural/tts_improve.py`
4. `backend/axiom_engine/memory/__init__.py`
5. `backend/axiom_engine/memory/semantic_store.py`
6. `backend/axiom_engine/tax/__init__.py` ← tax router (5 endpoints)
7. `backend/axiom_engine/tax/depreciation.py`
8. `backend/axiom_engine/tax/opportunity_zones.py`
9. `backend/axiom_engine/agents/manager.py` ← refactored
10. `backend/axiom_engine/agents/orchestrator.py` ← refactored
11. `backend/tests/test_finance_v5.py`

### Frontend (new V5 components)
12. `frontend/src/v5/index.ts`
13. `frontend/src/v5/features/neural/SwarmEngine.ts`
14. `frontend/src/v5/features/neural/AgentHandoff.tsx`
15. `frontend/src/v5/features/neural/RiskCalibrationDashboard.tsx`
16. `frontend/src/v5/features/tax/TaxIntelPanel.tsx`
17. `frontend/src/v5/features/gis/SiteMap3D.tsx`
18. `frontend/src/v5/features/governance/PortfolioGovernance.tsx`

---
