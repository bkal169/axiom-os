"""
Agents router — Axiom OS V5
Manages the 9-agent deal analysis pipeline.
"""
import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from axiom_engine.dependencies import get_ctx

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agents", tags=["agents"])

AGENT_SEQUENCE = [
    "market_researcher",
    "valuator",
    "legal",
    "strategist",
    "risk_officer",
    "capital_raiser",
    "debt_capital",
    "skeptic",
    "analyst",
]


class PipelineRequest(BaseModel):
    deal_id: str
    property_data: dict = {}


def _get_supabase():
    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
        if url and key:
            return create_client(url, key)
    except ImportError:
        pass
    return None

async def _run_pipeline(deal_id: str, property_data: dict):
    """Background task: run 9-agent pipeline, emit v5_events."""
    supabase = _get_supabase()

    for agent_name in AGENT_SEQUENCE:
        # Emit running event
        if supabase:
            supabase.table("v5_events").insert({
                "deal_id": deal_id,
                "event_type": "agent_started",
                "agent_name": agent_name,
                "status": "running",
                "payload": {"property_data": property_data},
            }).execute()

        try:
            result = await _call_agent(agent_name, deal_id, property_data)

            if supabase:
                # Update deal_analyses column
                supabase.table("deal_analyses").upsert({
                    "deal_id": deal_id,
                    agent_name: result,
                    "pipeline_status": "running",
                }, on_conflict="deal_id").execute()

                # Emit completed event
                supabase.table("v5_events").insert({
                    "deal_id": deal_id,
                    "event_type": "agent_completed",
                    "agent_name": agent_name,
                    "status": "completed",
                    "payload": result,
                }).execute()

        except Exception as e:
            logger.error(f"Agent {agent_name} failed for deal {deal_id}: {e}")
            if supabase:
                supabase.table("v5_events").insert({
                    "deal_id": deal_id,
                    "event_type": "agent_failed",
                    "agent_name": agent_name,
                    "status": "failed",
                    "payload": {"error": str(e)},
                }).execute()

    # Mark pipeline complete
    if supabase:
        supabase.table("deal_analyses").upsert({
            "deal_id": deal_id,
            "pipeline_status": "completed",
        }, on_conflict="deal_id").execute()

        supabase.table("v5_events").insert({
            "deal_id": deal_id,
            "event_type": "pipeline_complete",
            "status": "completed",
            "payload": {},
        }).execute()


async def _call_agent(agent_name: str, deal_id: str, property_data: dict) -> dict:
    """Call a single agent via Claude API."""
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

        prompts = {
            "market_researcher": f"Analyze the real estate market for this property: {property_data}. Provide market trends, comparables, and demand analysis.",
            "valuator": f"Provide a detailed valuation for: {property_data}. Include cap rate, NOI, ARV, and DCF analysis.",
            "legal": f"Review legal considerations for: {property_data}. Check title issues, zoning, and regulatory compliance.",
            "strategist": f"Develop investment strategy for: {property_data}. Include hold period, exit strategies, and value-add opportunities.",
            "risk_officer": f"Assess risks for: {property_data}. Quantify market, credit, liquidity, and operational risks.",
            "capital_raiser": f"Structure equity capital for: {property_data}. Suggest LP/GP structure, preferred returns, and waterfall.",
            "debt_capital": f"Recommend debt structure for: {property_data}. Include LTV, DSCR, loan terms, and lender types.",
            "skeptic": f"Challenge the investment thesis for: {property_data}. Identify weaknesses and downside scenarios.",
            "analyst": f"Synthesize all findings for: {property_data}. Provide final go/no-go recommendation with confidence score.",
        }

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompts.get(agent_name, f"Analyze: {property_data}")}],
        )
        return {"analysis": message.content[0].text, "agent": agent_name, "status": "completed"}
    except Exception as e:
        return {"error": str(e), "agent": agent_name, "status": "failed"}


@router.post("/pipeline/run")
async def run_pipeline(req: PipelineRequest, background_tasks: BackgroundTasks, ctx: dict = Depends(get_ctx)):
    """Kick off the 9-agent deal analysis pipeline."""
    deal_id = req.deal_id or str(uuid.uuid4())

    supabase = _get_supabase()
    if supabase:
        supabase.table("deal_analyses").upsert({
            "deal_id": deal_id,
            "pipeline_status": "running",
        }, on_conflict="deal_id").execute()

    background_tasks.add_task(_run_pipeline, deal_id, req.property_data)
    return {"deal_id": deal_id, "status": "started", "agents": AGENT_SEQUENCE}


@router.get("/pipeline/status/{deal_id}")
async def pipeline_status(deal_id: str, ctx: dict = Depends(get_ctx)):
    """Get current pipeline status for a deal."""
    supabase = _get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")

    result = supabase.table("deal_analyses").select("*").eq("deal_id", deal_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return result.data[0]


@router.get("/events/{deal_id}")
async def get_events(deal_id: str, ctx: dict = Depends(get_ctx)):
    """Get all v5_events for a deal."""
    supabase = _get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")

    result = supabase.table("v5_events").select("*").eq("deal_id", deal_id).order("created_at").execute()
    return result.data or []
