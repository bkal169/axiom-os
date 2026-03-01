import os
import sys
import time
from dotenv import load_dotenv
from supabase import create_client, Client

# Add current directory to path so we can import axiom_engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()
os.environ["MOCK_LLM"] = "true"

from axiom_engine.agents.orchestrator import process_deal

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

def test_market_researcher_tool():
    print("--- Testing Agent Tool: Market Researcher ---")
    
    # 1. Fetch Existing User
    print("1. Fetching Existing User...")
    response = supabase.table("user_profiles").select("id").limit(1).execute()
    if not response.data:
        print("FAILURE: No users found in 'user_profiles'. Please create a user in the app first.")
        return
    
    user_id = response.data[0]['id']
    print(f"   Using User ID: {user_id}")

    # 2. Create Test Intel
    print("2. Creating Test Intel for 'Austin, TX'...")
    intel_data = {
        "user_id": user_id,
        "record_type": "MARKET",
        "title": "Austin Tech Boom Report 2025",
        "state": "TX",
        "city": "Austin",
        "county": "Travis",
        "notes": "Oracle and Tesla expansions driving massive housing demand.",
        "metrics": {"growth": "high"},
        "internal_only": False
    }
    # Clean up old test intel if exists (optional, or just insert new)
    # For simplicity, we just insert.
    try:
        supabase.table("intel_records").insert(intel_data).execute()
    except Exception as e:
        print(f"Intel might already exist or error: {e}")

    # 3. Create Test Deal
    print("3. Creating Test Deal in 'Austin, TX'...")
    deal_data = {
        "user_id": user_id,

        "project_name": "Agent Test Tower",
        "location": "Austin, TX",
        "asset_type": "Multifamily",
        "stage": "due_diligence",
        "acquisition_price": 5000000,
        "notes": "Initial notes."
    }
    response = supabase.table("deals").insert(deal_data).execute()
    deal_id = response.data[0]['id']
    print(f"   Created Deal ID: {deal_id}")

    # 3. Run Agents
    print("3. Running Agent Orchestrator...")
    try:
        process_deal(deal_id)
    except Exception as e:
        print(f"   Orchestrator Failed: {e}")
        return

    # 4. Verify Output
    print("4. Verifying Output...")
    response = supabase.table("deals").select("notes").eq("id", deal_id).execute()
    notes = response.data[0]['notes']
    
    if "[Found Market Intel]" in notes:
        print("SUCCESS: Market Researcher successfully found and used the Intel Record!")
    else:
        print("FAILURE: Market Researcher did NOT cite the specific Intel Record context.")
        print("Notes Content:\n", notes)

    # Cleanup (Optional)
    # supabase.table("deals").delete().eq("id", deal_id).execute()

if __name__ == "__main__":
    test_market_researcher_tool()
