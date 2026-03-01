from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from axiom_engine.dependencies import get_ctx
from axiom_engine.store import search_properties, get_property_by_id
from axiom_engine.finance import DealInputs, project_deal
from axiom_engine.formatting import fmt_result, executive_summary
from axiom_engine.runlogic import run_deal_package
from axiom_engine.reporting import to_markdown_report
from axiom_engine.compare import compare_two
from axiom_engine.usage import enforce_run_limit, increment_runs

router = APIRouter(tags=["deals"])

class RunDealRequest(BaseModel):
    ltc: float
    interest_rate: float = 0.08
    amort_years: int = 30
    hold_years: int = 5
    noi_growth: float = 0.02
    exit_cap_rate: float = 0.06
    sale_cost_pct: float = 0.03
    purchase_price_override: float = 0.0
    noi_year1_override: float = 0.0
    capex_override: float = 0.0
    vacancy_override: float = -1.0

@router.get("/properties/search")
def properties_search(
    state: Optional[str] = None,
    asset_class: Optional[str] = None,
    min_sqft: Optional[float] = None,
    max_sqft: Optional[float] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    results = search_properties(
        state=state,
        asset_class=asset_class,
        min_sqft=min_sqft,
        max_sqft=max_sqft,
        min_price=min_price,
        max_price=max_price,
    )
    return {
        "count": len(results),
        "results": results,
    }

@router.get("/properties/{pid}")
def property_get(pid: str):
    p = get_property_by_id(pid)
    if not p:
        raise HTTPException(status_code=404, detail=f"Property {pid} not found")
    return p

@router.get("/properties/{pid}/model")
def model_property(
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
        raise HTTPException(status_code=422, detail=f"Property {pid} is missing noi_year1. Use Copilot for a custom deal run.")

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

    result = project_deal(deal)
    formatted = fmt_result(result)
    
    assumptions = {
        "ltc": ltc,
        "interest_rate": interest_rate,
        "amort_years": amort_years,
        "hold_years": hold_years,
        "noi_growth": noi_growth,
        "exit_cap_rate": exit_cap_rate,
        "sale_cost_pct": sale_cost_pct,
    }

    p_summary = {**p, "ask_price": purchase_price, "noi_year1": noi_year1}
    exec_sum = executive_summary(p_summary, assumptions, formatted)

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
        "assumptions": assumptions,
        "result": result,
        "formatted_result": formatted,
        "executive_summary": exec_sum,
    }

@router.post("/properties/{pid}/run")
def run_deal(
    pid: str,
    payload: RunDealRequest,
    ctx: dict = Depends(get_ctx)
):
    enforce_run_limit(ctx["org_id"], ctx["plan_config"])

    p = get_property_by_id(pid)
    if not p:
        raise HTTPException(status_code=404, detail=f"Property {pid} not found")

    pkg = run_deal_package(
        property_row=p,
        **payload.model_dump(),
        org_id=ctx["org_id"]
    )

    if "error" in pkg:
        raise HTTPException(status_code=422, detail=pkg)

    increment_runs(ctx["org_id"], 1)
    return pkg

@router.post("/properties/{pid}/report")
def property_report(
    pid: str,
    ltc: float = 0.70,
    interest_rate: float = 0.08,
    amort_years: int = 30,
    hold_years: int = 5,
    noi_growth: float = 0.02,
    exit_cap_rate: float = 0.06,
    sale_cost_pct: float = 0.03,
    purchase_price_override: float = 0.0,
    noi_year1_override: float = 0.0,
    capex_override: float = 0.0,
    vacancy_override: float = -1.0,
    ctx: dict = Depends(get_ctx)
):
    if not ctx["plan_config"].get("can_export"):
        raise HTTPException(status_code=403, detail="PLAN_UPGRADE_REQUIRED")
    enforce_run_limit(ctx["org_id"], ctx["plan_config"])

    p = get_property_by_id(pid)
    if not p:
        raise HTTPException(status_code=404, detail=f"Property {pid} not found")

    pkg = run_deal_package(
        property_row=p,
        ltc=ltc,
        interest_rate=interest_rate,
        amort_years=amort_years,
        hold_years=hold_years,
        noi_growth=noi_growth,
        exit_cap_rate=exit_cap_rate,
        sale_cost_pct=sale_cost_pct,
        purchase_price_override=purchase_price_override,
        noi_year1_override=noi_year1_override,
        capex_override=capex_override,
        vacancy_override=vacancy_override,
        org_id=ctx["org_id"]
    )

    if "error" in pkg:
        raise HTTPException(status_code=422, detail=pkg)

    increment_runs(ctx["org_id"])
    return {
        "property_id": pid,
        "markdown": to_markdown_report(pkg)
    }

@router.post("/compare")
def compare(
    pid1: str,
    pid2: str,
    ltc: float = 0.70,
    interest_rate: float = 0.08,
    amort_years: int = 30,
    hold_years: int = 5,
    noi_growth: float = 0.02,
    exit_cap_rate: float = 0.06,
    sale_cost_pct: float = 0.03,
    purchase_price_override: float = 0.0,
    noi_year1_override: float = 0.0,
    capex_override: float = 0.0,
    vacancy_override: float = -1.0,
    ctx: dict = Depends(get_ctx)
):
    if not ctx["plan_config"].get("can_compare"):
        raise HTTPException(status_code=403, detail="PLAN_UPGRADE_REQUIRED")
    enforce_run_limit(ctx["org_id"], ctx["plan_config"])

    p1 = get_property_by_id(pid1)
    p2 = get_property_by_id(pid2)
    if not p1 or not p2:
        return {"error": "not_found", "pid1_found": bool(p1), "pid2_found": bool(p2)}

    assumptions = dict(
        ltc=ltc,
        interest_rate=interest_rate,
        amort_years=amort_years,
        hold_years=hold_years,
        noi_growth=noi_growth,
        exit_cap_rate=exit_cap_rate,
        sale_cost_pct=sale_cost_pct,
        purchase_price_override=purchase_price_override,
        noi_year1_override=noi_year1_override,
        capex_override=capex_override,
        vacancy_override=vacancy_override,
    )

    increment_runs(ctx["org_id"], inc=2) # compare is 2 runs
    return compare_two(p1, p2, assumptions, org_id=ctx["org_id"])
