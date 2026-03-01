from fastapi import APIRouter, Depends
import sys
from typing import Dict, Any
from pydantic import BaseModel
from axiom_engine.dependencies import get_ctx
from axiom_engine.copilot import interpret, execute
from axiom_engine.router import route
from axiom_engine.runlogic import run_deal_package
from axiom_engine.usage import enforce_run_limit, increment_runs

router = APIRouter(prefix="/copilot", tags=["copilot"])

class CopilotIn(BaseModel):
    text: str

@router.post("/run")
def copilot_run(payload: CopilotIn):
    req = interpret(payload.text)
    return execute(req)

@router.post("/interpret")
def copilot_interpret(payload: CopilotIn):
    return interpret(payload.text)

@router.post("/execute")
def copilot_execute(payload: Dict[str, Any]):
    return execute(payload)

# New Analyze Endpoint
print("DEBUG: Importing brain...", file=sys.stderr)
from axiom_engine.brain import analyze_deal
print("DEBUG: Imported brain.", file=sys.stderr)

class AnalyzeIn(BaseModel):
    deal_data: Dict[str, Any]
    user_notes: str = ""

@router.post("/analyze")
def copilot_analyze(payload: AnalyzeIn):
    return analyze_deal(payload.deal_data, payload.user_notes)
print("DEBUG: Added /analyze route", file=sys.stderr)

@router.post("/find_and_run")
def copilot_find_and_run(
    payload: CopilotIn,
    ctx: dict = Depends(get_ctx)
):
    enforce_run_limit(ctx["org_id"], ctx["plan_config"])

    routed = route(payload.text)
    if not routed["selected"]:
        return {"error": "no_matches", "routed": routed}

    p = routed["selected"]
    inp = routed["deal_request"]["inputs"]

    # Optional overrides: Copilot may include NOI in the text; we'll use it as override
    # Only apply NOI override if user explicitly mentioned "noi" in the prompt
    noi_override = 0.0
    if "noi" in payload.text.lower():
        noi_override = float(inp.get("noi_year1") or 0.0)

    res_find = {
        "routed": routed["search"],
        "top_matches": routed.get("top_matches", []),
        "selected_id": p["id"],
        "deal": run_deal_package(
            property_row=p,
            ltc=float(inp["ltc"]),
            interest_rate=float(inp["interest_rate"]),
            amort_years=int(inp["amort_years"]),
            hold_years=int(inp["hold_years"]),
            noi_growth=float(inp.get("noi_growth", 0.02)),
            exit_cap_rate=float(inp["exit_cap_rate"]),
            sale_cost_pct=0.03,
            purchase_price_override=0.0,
            noi_year1_override=noi_override if noi_override > 0 else 0.0,
            capex_override=0.0,
            vacancy_override=-1.0,
            org_id=ctx["org_id"]
        )
    }
    increment_runs(ctx["org_id"], 1)
    return res_find
