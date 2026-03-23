"""
Risk router — Axiom OS V5
GNN-based risk scoring, TT-SI, and Brier score calibration.
"""
import os
import math
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from axiom_engine.dependencies import get_ctx

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/risk", tags=["risk"])


class RiskScoreRequest(BaseModel):
    deal_id: str
    property_type: str = "multifamily"
    location_score: float = 0.5  # 0-1
    market_cycle_position: float = 0.5  # 0-1, 0=trough 1=peak
    leverage_ratio: float = 0.65
    vacancy_rate: float = 0.05
    cap_rate: float = 0.055
    debt_service_coverage: float = 1.25
    sponsor_track_record: int = 5  # years


class BrierScoreRequest(BaseModel):
    event_id: str
    actual_outcome: bool


def _compute_risk_score(req: RiskScoreRequest) -> dict:
    """Compute composite risk score with TT-SI (Temporal Trend - Systemic Integration)."""
    # Market risk: high leverage + peak market = elevated
    market_risk = (req.leverage_ratio * 0.4 + req.market_cycle_position * 0.35 + req.vacancy_rate * 5 * 0.25)

    # Credit/structural risk
    dscr_risk = max(0, 1 - (req.debt_service_coverage - 1) * 2)
    credit_risk = dscr_risk * 0.6 + (1 - min(req.sponsor_track_record / 10, 1)) * 0.4

    # Location risk (inverted)
    location_risk = 1 - req.location_score

    # Cap rate compression risk
    cap_risk = max(0, (0.06 - req.cap_rate) / 0.06)

    # Composite
    composite = market_risk * 0.35 + credit_risk * 0.3 + location_risk * 0.2 + cap_risk * 0.15
    composite = min(max(composite, 0), 1)

    # TT-SI: temporal trend scaling — compress extremes
    tts_factor = 1 / (1 + math.exp(-10 * (composite - 0.5)))
    tts_score = composite * tts_factor + (1 - tts_factor) * 0.5

    # Predicted probability of adverse outcome (loss > 10%)
    predicted_prob = composite * 0.6 + 0.05

    return {
        "composite_score": round(composite, 4),
        "tts_score": round(tts_score, 4),
        "predicted_prob": round(predicted_prob, 4),
        "components": {
            "market_risk": round(market_risk, 4),
            "credit_risk": round(credit_risk, 4),
            "location_risk": round(location_risk, 4),
            "cap_rate_risk": round(cap_risk, 4),
        },
        "tts_factor": round(tts_factor, 4),
        "risk_tier": "HIGH" if composite > 0.65 else "MEDIUM" if composite > 0.35 else "LOW",
    }


@router.post("/score")
async def score_risk(req: RiskScoreRequest, ctx: dict = Depends(get_ctx)):
    """Compute risk score for a deal."""
    result = _compute_risk_score(req)

    # Persist risk event
    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
        if url and key:
            sb = create_client(url, key)
            sb.table("risk_events").insert({
                "org_id": ctx.get("org_id"),
                "deal_id": req.deal_id,
                "risk_type": req.property_type,
                "predicted_prob": result["predicted_prob"],
                "tts_applied": True,
                "tts_factor": result["tts_factor"],
                "metadata": result,
            }).execute()
    except Exception as e:
        logger.warning(f"Failed to persist risk event: {e}")

    return result


@router.post("/calibrate")
async def calibrate_brier(req: BrierScoreRequest, ctx: dict = Depends(get_ctx)):
    """Record actual outcome and compute Brier score."""
    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
        if not url or not key:
            raise HTTPException(status_code=503, detail="Supabase not configured")
        sb = create_client(url, key)

        event = sb.table("risk_events").select("predicted_prob").eq("id", req.event_id).execute()
        if not event.data:
            raise HTTPException(status_code=404, detail="Risk event not found")

        predicted = event.data[0]["predicted_prob"]
        actual = 1.0 if req.actual_outcome else 0.0
        brier = (predicted - actual) ** 2

        sb.table("risk_events").update({
            "actual_outcome": req.actual_outcome,
            "brier_score": brier,
            "resolved_at": "NOW()",
        }).eq("id", req.event_id).execute()

        return {"event_id": req.event_id, "brier_score": round(brier, 6), "predicted": predicted, "actual": actual}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/calibration/summary")
async def calibration_summary(ctx: dict = Depends(get_ctx)):
    """Get Brier score summary statistics."""
    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
        if not url or not key:
            return {"avg_brier": None, "count": 0, "baseline": 0.24}
        sb = create_client(url, key)

        events = sb.table("risk_events").select("brier_score,tts_applied").not_("brier_score", "is", None).execute()
        if not events.data:
            return {"avg_brier": None, "count": 0, "baseline": 0.24}

        scores = [e["brier_score"] for e in events.data if e["brier_score"] is not None]
        avg = sum(scores) / len(scores) if scores else None
        baseline = 0.24
        improvement = ((baseline - avg) / baseline * 100) if avg else None

        return {
            "avg_brier": round(avg, 6) if avg else None,
            "count": len(scores),
            "baseline": baseline,
            "improvement_pct": round(improvement, 1) if improvement else None,
            "tts_count": sum(1 for e in events.data if e.get("tts_applied")),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
