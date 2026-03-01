from fastapi import APIRouter
from pydantic import BaseModel
from axiom_engine.finance import (
    monthly_payment, amort_schedule,
    insurance_estimate_annual, construction_cost_estimate,
    DealInputs, project_deal
)
from axiom_engine.invest import (
    npv_from_cashflows, irr_from_cashflows, refinance_compare, RefiCompareInputs
)

router = APIRouter(prefix="/calc", tags=["calculators"])

class CashflowsIn(BaseModel):
    discount_rate: float | None = None
    cashflows: list[float]

class RefiIn(BaseModel):
    principal: float
    annual_rate_current: float
    annual_rate_new: float
    amort_years: int = 30
    months_remaining: int = 360
    refi_costs: float = 0.0

@router.get("/mortgage")
def calc_mortgage(
    principal: float,
    annual_rate: float,
    amort_years: int = 30,
    months_preview: int = 12
):
    pmt = monthly_payment(principal, annual_rate, amort_years)
    sched = amort_schedule(principal, annual_rate, amort_years, months=months_preview)

    preview = [
        {
            "period": r.period,
            "payment": r.payment,
            "interest": r.interest,
            "principal": r.principal,
            "balance": r.balance,
        }
        for r in sched
    ]

    return {
        "principal": principal,
        "annual_rate": annual_rate,
        "amort_years": amort_years,
        "monthly_payment": pmt,
        "preview_months": months_preview,
        "amort_preview": preview,
    }

@router.get("/insurance")
def calc_insurance(
    replacement_cost: float,
    asset_class: str = "other",
    location_risk: float = 1.0,
    liability_limit_m: float = 1.0,
):
    annual = insurance_estimate_annual(
        replacement_cost=replacement_cost,
        asset_class=asset_class,
        location_risk=location_risk,
        liability_limit_m=liability_limit_m
    )
    return {
        "replacement_cost": replacement_cost,
        "asset_class": asset_class,
        "location_risk": location_risk,
        "liability_limit_m": liability_limit_m,
        "estimated_annual_premium": annual
    }

@router.get("/construction")
def calc_construction(
    sqft: float,
    cost_per_sf: float,
    contingency_pct: float = 0.10,
):
    total = construction_cost_estimate(sqft, cost_per_sf, contingency_pct)
    return {
        "sqft": sqft,
        "cost_per_sf": cost_per_sf,
        "contingency_pct": contingency_pct,
        "estimated_total_cost": total
    }

@router.post("/npv")
def calc_npv(payload: CashflowsIn):
    if payload.discount_rate is None:
        return {"error": "discount_rate_required"}
    val = npv_from_cashflows(payload.discount_rate, payload.cashflows)
    return {"discount_rate": payload.discount_rate, "cashflows": payload.cashflows, "npv": val}

@router.post("/irr")
def calc_irr(payload: CashflowsIn):
    val = irr_from_cashflows(payload.cashflows)
    return {"cashflows": payload.cashflows, "irr": val}

class ProjectionsIn(BaseModel):
    purchase_price: float
    equity: float
    loan_amount: float
    interest_rate: float
    amort_years: int
    hold_years: int
    noi_year1: float
    noi_growth: float = 0.02
    exit_cap_rate: float = 0.06
    sale_cost_pct: float = 0.03

@router.post("/projections")
def calc_projections(payload: ProjectionsIn):
    inputs = DealInputs(**payload.model_dump())
    results = project_deal(inputs)
    return results
