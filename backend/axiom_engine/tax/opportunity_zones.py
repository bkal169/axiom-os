"""Axiom OS V5 — Opportunity Zone Lookup"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def lookup_oz_by_coordinates(lat: float, lng: float, supabase) -> Optional[dict]:
    try:
        result = supabase.rpc("find_oz_by_coordinates", {"lat": lat, "lng": lng}).execute()
        if result.data:
            return result.data[0]
    except Exception:
        pass
    return None


def check_oz_eligibility(deal: dict, supabase) -> dict:
    lat = float(deal.get("lat") or deal.get("latitude") or 0)
    lng = float(deal.get("lng") or deal.get("longitude") or 0)
    if not lat or not lng:
        return {"eligible": False, "reason": "No coordinates on deal record", "tract_id": None}
    tract = lookup_oz_by_coordinates(lat, lng, supabase)
    if not tract:
        return {"eligible": False, "reason": "Not within a designated Opportunity Zone", "tract_id": None}
    purchase_price = float(deal.get("purchase_price") or 0)
    capital_gain = float(deal.get("capital_gain_amount") or purchase_price * 0.2)
    benefits = calculate_oz_benefits(capital_gain, investment_year=2026)
    return {
        "eligible": True, "tract_id": tract.get("tract_id"),
        "state": tract.get("state"), "county": tract.get("county"),
        "expires_at": tract.get("expires_at"),
        "capital_gain_deferred": round(capital_gain, 2),
        "step_up_pct": benefits["step_up_pct"],
        "exclusion_eligible": benefits["exclusion_eligible"],
        "estimated_tax_benefit": benefits["estimated_benefit"],
    }


def calculate_oz_benefits(capital_gain: float, investment_year: int = 2026, tax_rate: float = 0.238) -> dict:
    deferred_tax = capital_gain * tax_rate
    step_up_pct = 0.0
    if investment_year <= 2021: step_up_pct = 0.15
    elif investment_year <= 2022: step_up_pct = 0.10
    exclusion_eligible = investment_year <= 2026
    exclusion_value = (capital_gain * 0.50 * tax_rate) if exclusion_eligible else 0
    return {
        "step_up_pct": step_up_pct, "exclusion_eligible": exclusion_eligible,
        "estimated_benefit": round(deferred_tax * 0.15 + exclusion_value, 2),
        "deferred_tax": round(deferred_tax, 2),
    }


def save_oz_link(deal_id: str, oz_result: dict, supabase) -> Optional[str]:
    if not oz_result.get("eligible"):
        return None
    try:
        result = supabase.table("deal_oz_links").insert({
            "deal_id": deal_id, "tract_id": oz_result["tract_id"],
            "capital_gain_deferred": oz_result.get("capital_gain_deferred", 0),
            "step_up_pct": oz_result.get("step_up_pct", 0),
            "exclusion_eligible": oz_result.get("exclusion_eligible", False),
            "qualified": True,
        }).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        logger.error(f"Failed to save OZ link: {e}")
        return None
