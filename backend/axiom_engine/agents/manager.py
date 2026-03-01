import sys
import os
from apscheduler.schedulers.background import BackgroundScheduler
from supabase import create_client, Client

# Global supabase client (lazy initialized)
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
    """
    Poller for deals in Due Diligence.
    """
    sb = get_supabase()
    if not sb:
        print("DEBUG: [Agent Manager] Supabase not configured.", file=sys.stderr)
        return

    # print("DEBUG: [Agent Manager] Scanning for deals in Due Diligence...", file=sys.stderr) # noisy logs
    try:
        # Fetch deals in due_diligence
        response = sb.table("deals").select("*").eq("stage", "due_diligence").execute()
        deals = response.data or []
        
        # dynamic import to avoid circular dependency if orchestrator imports anything
        from .orchestrator import process_deal
        
        for deal in deals:
            # Check if processed
            notes = deal.get("notes") or ""
            if "** Investment Committee Memo **" not in notes:
                print(f"DEBUG: [Agent Manager] Found new deal {deal['id']}. Dispatching Agents.", file=sys.stderr)
                process_deal(deal['id'])
                
    except Exception as e:
        print(f"DEBUG: [Agent Manager] Error scanning: {e}", file=sys.stderr)

def start_agents():
    if not scheduler.running:
        scheduler.add_job(watch_due_diligence, 'interval', seconds=15, id='analyst_watch') # 15s for faster testing
        scheduler.start()
        print("DEBUG: [Agent Manager] Scheduler Started", file=sys.stderr)

def stop_agents():
    if scheduler.running:
        scheduler.shutdown()
        print("DEBUG: [Agent Manager] Scheduler Stopped", file=sys.stderr)
