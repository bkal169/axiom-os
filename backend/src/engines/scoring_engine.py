"""
backend/src/engines/scoring_engine.py
Phase 4 Deal Scoring Engine — heuristic composite scoring with
SHAP-style driver explanations and mitigation levers.

TODO:
  - Replace heuristic with a trained scikit-learn / XGBoost model
  - Load model from models registry table (model_name, model_version)
  - Pull features from feature_warehouse table
  - Implement real SHAP value explanations
"""

from typing import Dict


class DealScoringEngine:
    """
    Skeleton scoring engine — composite score across IRR, DSCR,
    risk, and feasibility dimensions.
    """

    def __init__(self, db=None):
        self.db = db  # Supabase or SQLAlchemy session

    async def score_deal(self, project_id: str) -> Dict:
        """
        Returns a composite deal score with subscores and mitigation levers.
        Persisted to scoring_events table by the Edge Function caller.
        """
        # TODO: fetch real project state and features from Supabase
        # project = await self.db.from_("projects").select("state").eq("id", project_id).single()
        state = {}

        irr = state.get("finance", {}).get("irr", 18.0)
        dscr = state.get("finance", {}).get("dscr", 1.3)
        risk_score = state.get("risk", {}).get("score", 65.0)

        # Heuristic composite (same logic as Edge Function for consistency)
        composite = 0.0
        composite += max(0.0, min(1.0, irr / 25.0)) * 40.0
        composite += max(0.0, min(1.0, (dscr - 1.0) / 0.5)) * 25.0
        composite += max(0.0, min(1.0, (100.0 - risk_score) / 40.0)) * 25.0
        composite += 10.0  # base
        composite = max(0.0, min(100.0, composite))

        return {
            "composite_score": round(composite, 1),
            "confidence":      60.0,
            "subscores": {
                "feasibility":    round(composite, 1),
                "timeline_risk":  state.get("risk", {}).get("timeline_risk", 30.0),
                "budget_risk":    state.get("risk", {}).get("budget_risk", 25.0),
                "financeability": 80.0 if dscr >= 1.25 else 60.0,
            },
            "top_drivers": [
                {
                    "feature":     "IRR",
                    "impact":      irr,
                    "description": "Higher target IRR increases feasibility score.",
                },
                {
                    "feature":     "DSCR",
                    "impact":      dscr,
                    "description": "Stronger DSCR improves financeability sub-score.",
                },
                {
                    "feature":     "Risk Score",
                    "impact": -risk_score,
                    "description": "Higher risk score reduces composite. Mitigate key findings.",
                },
            ],
            "mitigation_levers": [
                "Reduce leverage to improve DSCR and financeability.",
                "Resolve flagged risks (flood, permitting, env.) to raise composite score.",
                "Extend hold period to reduce exit cap rate sensitivity.",
            ],
        }
