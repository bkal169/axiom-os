"""Axiom OS V5 — Tax API Router"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from axiom_engine.dependencies import get_ctx

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tax", tags=["Tax Intelligence"])


def get_supabase():
    import os
    from supabase import create_client
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    return create_client(url, key)


@router.get("/codes")
def get_tax_codes(state: str = None, category: str = None, ctx: dict = Depends(get_ctx)):
    try:
        supa = get_supabase()
        query = supa.table("tax_codes").select("*")
        if state:
            query = query.ilike("jurisdiction", f"%{state}%")
        if category:
            query = query.eq("category", category)
        result = query.limit(100).execute()
        return {"codes": result.data or [], "count": len(result.data or [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/oz/{deal_id}")
def get_oz_eligibility(deal_id: str, ctx: dict = Depends(get_ctx)):
    try:
        supa = get_supabase()
        deal_result = supa.table("deals").select("*").eq("id", deal_id).execute()
        if not deal_result.data:
            raise HTTPException(status_code=404, detail="Deal not found")
        from axiom_engine.tax.opportunity_zones import check_oz_eligibility
        return check_oz_eligibility(deal_result.data[0], supa)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/depreciation/{project_id}")
def get_depreciation_schedule(project_id: str, ctx: dict = Depends(get_ctx)):
    try:
        supa = get_supabase()
        result = supa.table("depreciation_schedules").select("*").eq("project_id", project_id).execute()
        return {"schedules": result.data or [], "project_id": project_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/1031/{deal_id}")
def get_1031_exchange(deal_id: str, ctx: dict = Depends(get_ctx)):
    try:
        supa = get_supabase()
        result = supa.table("tax_1031_exchanges").select("*").or_(
            f"relinquished_deal_id.eq.{deal_id},replacement_deal_id.eq.{deal_id}"
        ).execute()
        return {"exchanges": result.data or [], "deal_id": deal_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assess/{deal_id}")
def trigger_assessment(deal_id: str, ctx: dict = Depends(get_ctx)):
    try:
        supa = get_supabase()
        deal_result = supa.table("deals").select("location").eq("id", deal_id).execute()
        if not deal_result.data:
            raise HTTPException(status_code=404, detail="Deal not found")
        return {
            "status": "queued", "deal_id": deal_id,
            "message": f"Assessment queued for {deal_result.data[0].get('location', 'unknown')}",
            "note": "Requires ATTOM or county API keys."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
