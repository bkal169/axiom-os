"""Axiom OS V5 — Agent Manager (polls deal_analyses not notes blob)"""
import os
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from supabase import create_client, Client

logger = logging.getLogger(__name__)
supabase: Client = None


def get_supabase() -> Client:
    global supabase
    if supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if url and key:
            supabase = create_client(url, key)
    return supabase


scheduler = BackgroundScheduler()


def watch_due_diligence():
    sb = get_supabase()
    if not sb:
        logger.warning("[Agent Manager] Supabase not configured — skipping poll.")
        return
    try:
        response = sb.table("deals").select("id").eq("stage", "due_diligence").execute()
        deals = response.data or []
        from .orchestrator import process_deal
        for deal in deals:
            existing = sb.table("deal_analyses").select("id").eq(
                "deal_id", deal["id"]).eq("agent_type", "analyst").limit(1).execute()
            if not existing.data:
                logger.info(f"[Agent Manager] Dispatching agents for deal {deal['id']}")
                process_deal(deal["id"])
    except Exception as e:
        logger.error(f"[Agent Manager] Poll error: {e}")


def start_agents():
    if not scheduler.running:
        scheduler.add_job(watch_due_diligence, "interval", seconds=60, id="analyst_watch")
        scheduler.start()
        logger.info("[Agent Manager] Scheduler started — polling every 60s")


def stop_agents():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("[Agent Manager] Scheduler stopped")
