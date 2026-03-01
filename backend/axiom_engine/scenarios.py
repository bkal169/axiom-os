from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from .finance import DealInputs, project_deal
from .store import get_property_by_id
from .runlogic import run_scenarios, run_deal_package

router = APIRouter()

@router.post("/properties/{pid}/scenarios")
def scenarios_property(
    pid: str,
    ltc: float = 0.70,
    interest_rate: float = 0.08,
    amort_years: int = 30,
    hold_years: int = 5,
    noi_growth: float = 0.02,
    exit_cap_rate: float = 0.06,
    sale_cost_pct: float = 0.03,
):
    p = get_property_by_id(pid)
    if not p:
        raise HTTPException(status_code=404, detail=f"Property {pid} not found")

    purchase_price = float(p.get("ask_price") or 0.0)
    noi_year1 = float(p.get("noi_year1") or 0.0)

    if purchase_price <= 0:
        raise HTTPException(status_code=422, detail=f"Property {pid} is missing ask_price")
    if noi_year1 <= 0:
        raise HTTPException(status_code=422, detail=f"Property {pid} is missing noi_year1")

    loan_amount = purchase_price * ltc
    equity = purchase_price - loan_amount

    deal = DealInputs(
        purchase_price=purchase_price,
        equity=equity,
        loan_amount=loan_amount,
        interest_rate=interest_rate,
        amort_years=amort_years,
        hold_years=hold_years,
        noi_year1=noi_year1,
        noi_growth=noi_growth,
        exit_cap_rate=exit_cap_rate,
        sale_cost_pct=sale_cost_pct,
    )

    scenarios = run_scenarios(deal)

    return {
        "property": {
            "id": p["id"],
            "address": p["address"],
            "city": p["city"],
            "state": p["state"],
            "asset_class": p["asset_class"],
            "sqft": p["sqft"],
            "ask_price": purchase_price,
            "noi_year1": noi_year1,
        },
        "assumptions": {
            "ltc": ltc,
            "interest_rate": interest_rate,
            "amort_years": amort_years,
            "hold_years": hold_years,
            "noi_growth": noi_growth,
            "exit_cap_rate": exit_cap_rate,
            "sale_cost_pct": sale_cost_pct,
        },
        "scenarios": scenarios
    }



