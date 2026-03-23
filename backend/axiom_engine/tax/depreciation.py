"""Axiom OS V5 — MACRS Depreciation Engine"""
import logging
from datetime import date
from typing import Literal, Optional

logger = logging.getLogger(__name__)

MACRS_LIVES: dict = {
    "residential": 27.5, "commercial": 39.0, "land_improvements": 15.0,
    "equipment_5yr": 5.0, "equipment_7yr": 7.0,
    "computers": 5.0, "vehicles": 5.0, "furniture": 7.0,
}

BONUS_RATES: dict = {2022: 1.00, 2023: 0.80, 2024: 0.60, 2025: 0.40, 2026: 0.20, 2027: 0.00}


def get_bonus_rate(year: int) -> float:
    return BONUS_RATES.get(year, 0.0)


def build_macrs_schedule(cost_basis: float, asset_class: str, placed_in_service_date: date,
                          method: Literal["MACRS", "SL", "bonus"] = "MACRS") -> list:
    useful_life = MACRS_LIVES.get(asset_class.lower().replace(" ", "_"), 39.0)
    year = placed_in_service_date.year
    remaining = cost_basis
    schedule = []

    if method == "bonus":
        bonus_rate = get_bonus_rate(year)
        if bonus_rate > 0:
            first = cost_basis * bonus_rate
            remaining -= first
            schedule.append({"year": year, "deduction": round(first, 2),
                              "remaining_basis": round(remaining, 2), "method": f"bonus_{int(bonus_rate*100)}pct"})
            year += 1
            cost_basis = remaining
        method = "SL"
        useful_life = max(useful_life - 1, 1)

    if useful_life <= 0:
        return schedule

    annual = cost_basis / useful_life
    periods = int(useful_life) + (1 if useful_life % 1 > 0 else 0)
    for i in range(periods):
        if remaining <= 0.01:
            break
        deduction = min(annual, remaining)
        remaining = max(0.0, remaining - deduction)
        schedule.append({"year": year + i, "deduction": round(deduction, 2),
                          "remaining_basis": round(remaining, 2), "method": method})
    return schedule


def save_schedule(project_id: str, asset_class: str, cost_basis: float,
                  placed_in_service_date: date, method: str, schedule: list, supabase) -> Optional[str]:
    try:
        annual = schedule[0]["deduction"] if schedule else 0
        useful_life = MACRS_LIVES.get(asset_class.lower().replace(" ", "_"), 39.0)
        result = supabase.table("depreciation_schedules").insert({
            "project_id": project_id, "asset_class": asset_class, "cost_basis": cost_basis,
            "useful_life_years": int(useful_life), "method": method,
            "placed_in_service_date": placed_in_service_date.isoformat(),
            "annual_deduction": annual, "accumulated_depreciation": 0, "schedule": schedule,
        }).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        logger.error(f"Failed to save depreciation schedule: {e}")
        return None
