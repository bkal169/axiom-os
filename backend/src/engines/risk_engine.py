"""
backend/src/engines/risk_engine.py
Phase 4 Risk Engine — skeleton with stub outputs.
Integrates with Supabase via the engines-risk Edge Function.
Replace stub logic with real FEMA/EPA/terrain/zoning data lookups.
"""

from typing import Dict, List
from dataclasses import dataclass, field, asdict
from enum import Enum


class RiskSeverity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MODERATE = "moderate"
    LOW = "low"


@dataclass
class RiskFinding:
    risk_type: str
    severity: RiskSeverity
    description: str
    impact_to_timeline_days: int
    impact_to_cost_pct: float
    mitigation_actions: List[str]
    confidence: float

    def to_dict(self) -> Dict:
        d = asdict(self)
        d["severity"] = self.severity.value
        return d


class RiskEngine:
    """
    Skeleton risk engine — assesses project-level risk from spatial,
    regulatory, environmental, and financial inputs.

    TODO: replace stubs with:
      - FEMA flood zone lookups (FIRM API)
      - EPA site contamination (ECHO API)
      - State/county zoning APIs
      - ML model trained on historical permit delays
    """

    def __init__(self, db=None):
        self.db = db  # Supabase client or SQLAlchemy session

    async def assess_project_risk(self, project_id: str) -> Dict:
        """
        Returns a structured risk profile for a project.
        Persisted to risk_events table by the Edge Function caller.
        """
        # TODO: fetch project state from Supabase
        # project = await self.db.from_("projects").select("state").eq("id", project_id).single()

        findings = [
            RiskFinding(
                risk_type="flood_hazard",
                severity=RiskSeverity.HIGH,
                description="Site may be in or near a FEMA flood hazard area (Zone AE).",
                impact_to_timeline_days=30,
                impact_to_cost_pct=5.0,
                mitigation_actions=[
                    "Order updated flood elevation certificate",
                    "Consult civil engineer regarding drainage and grading",
                    "Evaluate flood insurance requirements and cost",
                ],
                confidence=0.6,
            )
        ]

        risk_score = 65.0
        narrative = (
            "Initial risk assessment indicates elevated flood exposure. "
            "Environmental, zoning, and title risks not yet quantified. "
            "Integrate FEMA FIRM, EPA ECHO, and county parcel APIs to refine."
        )

        return {
            "risk_score": risk_score,
            "findings": [f.to_dict() for f in findings],
            "narrative": narrative,
            "total_time_impact_days": sum(f.impact_to_timeline_days for f in findings),
            "total_cost_impact_pct": sum(f.impact_to_cost_pct for f in findings),
        }
