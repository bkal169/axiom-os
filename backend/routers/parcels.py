from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
import json
import tempfile
from pathlib import Path
from axiom_engine.dependencies import get_ctx
from axiom_engine.parcels import ingest_csv, search_parcels, get_parcel_by_id
from axiom_engine.parcel_scoring import score_parcel
from axiom_engine.parcel_convert import parcel_to_property
from axiom_engine.runlogic import run_deal_package
from axiom_engine.usage import enforce_run_limit, increment_runs
from pydantic import BaseModel

router = APIRouter(prefix="/parcels", tags=["parcels"])

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

@router.post("/ingest")
async def parcels_ingest(
    mapping: str = Form(...),
    defaults: str = Form("{}"),
    file: UploadFile = File(...),
    ctx: dict = Depends(get_ctx)
):
    # Plan gate: keep ingest as PRO+ only
    if ctx["plan"] == "FREE":
        raise HTTPException(status_code=403, detail="PLAN_UPGRADE_REQUIRED")

    try:
        mapping_dict = json.loads(mapping)
        defaults_dict = json.loads(defaults)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="INVALID_JSON_IN_FORM")

    suffix = Path(file.filename).suffix.lower() if file.filename else ".csv"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    return ingest_csv(tmp_path, mapping=mapping_dict, defaults=defaults_dict)

@router.get("/search")
def parcels_search_route(
    state: str | None = None,
    county: str | None = None,
    min_lot_sqft: float | None = None,
    min_bldg_sqft: float | None = None,
    land_use: str | None = None,
    q: str | None = None,
    limit: int = 50,
    ctx: dict = Depends(get_ctx)
):
    return search_parcels(
        state=state,
        county=county,
        min_lot_sqft=min_lot_sqft,
        min_bldg_sqft=min_bldg_sqft,
        land_use=land_use,
        q=q,
        limit=limit
    )

@router.get("/search_scored")
def parcels_search_scored_route(
    state: str | None = None,
    county: str | None = None,
    min_lot_sqft: float | None = None,
    min_bldg_sqft: float | None = None,
    land_use: str | None = None,
    q: str | None = None,
    limit: int = 50,
    min_score: float = 0.0,
    ctx: dict = Depends(get_ctx)
):
    res = search_parcels(
        state=state,
        county=county,
        min_lot_sqft=min_lot_sqft,
        min_bldg_sqft=min_bldg_sqft,
        land_use=land_use,
        q=q,
        limit=min(limit, 200)
    )
    scored = []
    for p in res["results"]:
        s = score_parcel(p)
        if s["score"] >= min_score:
            scored.append({**p, "_score": s})

    scored.sort(key=lambda x: x["_score"]["score"], reverse=True)
    return {"count": len(scored), "results": scored[: max(1, min(limit, 200))]}

@router.post("/{parcel_id}/run")
def run_from_parcel(
    parcel_id: str,
    payload: RunDealRequest,  # Use body payload for assumptions, query params for multipliers if desired, 
    # but let's stick to standardizing on payload or params. In app.py I used query params mixed with payload?
    # Checking app.py: it defined payload: RunDealRequest AND query params (assessed_multiplier, etc).
    # FastAPI handles mixed body/query fine.
    # Let's align with app.py signature to avoid breaking verify script.
    # app.py signature:
    # def run_from_parcel(parcel_id, assessed_multiplier, assumed_cap_rate, ...lots of individual params..., ctx)
    # Wait, in app.py it was individual params, NOT RunDealRequest model, except for `run_deal` (properties/{pid}/run).
    # Ah, `run_from_parcel` (parcels/{id}/run) in `app.py` line 770 used individual query params!
    # I should convert it to use RunDealRequest model in the body for cleaner API, OR keep it as is.
    # Given I'm refactoring, cleaner is better. But I must update `verify_parcel_flow.py` if I change it.
    # Let's check `verify_parcel_flow.py`. It uses `run_params = {...}` and passes `params=run_params`.
    # So it expects query parameters.
    # I will keep query parameters for compatibility, but I'll define them explicitly as app.py did.
    
    # RE-CHECK app.py:
    # @app.post("/parcels/{parcel_id}/run")
    # def run_from_parcel(parcel_id: str, assessed_multiplier: float..., ctx...)
    # Yes, individual params.
    
    assessed_multiplier: float = 1.35,
    assumed_cap_rate: float = 0.065,
    ltc: float = 0.70,
    interest_rate: float = 0.08,
    amort_years: int = 30,
    hold_years: int = 5,
    noi_growth: float = 0.02,
    exit_cap_rate: float = 0.06,
    sale_cost_pct: float = 0.03,
    capex_override: float = 0.0,
    vacancy_override: float = -1.0,
    ctx: dict = Depends(get_ctx)
):
    enforce_run_limit(ctx["org_id"], ctx["plan_config"])

    parcel = get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel {parcel_id} not found")

    prop = parcel_to_property(parcel, assessed_multiplier=assessed_multiplier, assumed_cap_rate=assumed_cap_rate)

    pkg = run_deal_package(
        property_row=prop,
        ltc=ltc,
        interest_rate=interest_rate,
        amort_years=amort_years,
        hold_years=hold_years,
        noi_growth=noi_growth,
        exit_cap_rate=exit_cap_rate,
        sale_cost_pct=sale_cost_pct,
        purchase_price_override=0.0, # derived from convert
        noi_year1_override=0.0, # derived from convert
        capex_override=capex_override,
        vacancy_override=vacancy_override,
        org_id=ctx["org_id"]
    )

    if "error" in pkg:
        raise HTTPException(status_code=422, detail=pkg)

    increment_runs(ctx["org_id"], 1)
    return {"parcel_id": parcel_id, "property_derived": prop, "deal": pkg}
