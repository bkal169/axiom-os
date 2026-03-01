from typing import Dict, Any, Tuple
import math

# Simple, explainable scoring (MVP).
# Score range: 0 - 100
# You can tune weights later.

def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def _log_score(value: float, lo: float, hi: float) -> float:
    """
    Maps value in [lo,hi] into [0,1] using a log curve to reduce outlier dominance.
    """
    if value <= lo:
        return 0.0
    if value >= hi:
        return 1.0
    # log normalization
    return (math.log(value) - math.log(lo)) / (math.log(hi) - math.log(lo))

def score_parcel(p: Dict[str, Any], target: str = "development") -> Dict[str, Any]:
    lot_sqft = float(p.get("lot_sqft") or 0.0)
    bldg_sqft = float(p.get("bldg_sqft") or 0.0)
    zoning = (p.get("zoning") or "").lower()
    land_use = (p.get("land_use") or "").lower()

    # Size score (favor big lots for development)
    lot_component = _log_score(max(lot_sqft, 1.0), lo=20_000, hi=2_000_000)  # ~0.46 acres to ~46 acres
    bldg_component = _log_score(max(bldg_sqft, 1.0), lo=5_000, hi=200_000)

    # Zoning heuristics
    zoning_good = 0.0
    if any(k in zoning for k in ["mu", "mixed", "rmf", "mf", "cbd", "commercial", "cg", "il", "ind", "pd"]):
        zoning_good = 1.0
    if any(k in zoning for k in ["conservation", "ag", "wetland", "preserve"]):
        zoning_good = 0.2

    # Land use heuristics
    use_good = 0.0
    if any(k in land_use for k in ["commercial", "vacant", "industrial", "mixed", "retail", "office", "multi"]):
        use_good = 1.0
    if any(k in land_use for k in ["single family", "residential sf", "homestead"]):
        use_good = 0.4

    # Assemble weighted score
    # Heavier weight on lot for development hunting
    score = (
        45 * lot_component +
        20 * bldg_component +
        20 * zoning_good +
        15 * use_good
    )
    score = _clamp(score, 0, 100)

    # Explainability (important)
    reasons = []
    reasons.append(f"Lot size component: {lot_component:.2f}")
    reasons.append(f"Building size component: {bldg_component:.2f}")
    
    zoning_val = p.get('zoning') or "N/A"
    reasons.append(f"Zoning fit: {zoning_good:.2f} ({zoning_val})")
    
    land_use_val = p.get('land_use') or "N/A"
    reasons.append(f"Land use fit: {use_good:.2f} ({land_use_val})")

    tier = "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D"

    return {"score": round(score, 1), "tier": tier, "reasons": reasons}
