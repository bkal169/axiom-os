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

def test_capital_raiser_agent():
    print("--- Testing Agent: Capital Raiser ---")
    
    # 1. Fetch Existing User
    print("1. Fetching Existing User...")
    response = supabase.table("user_profiles").select("id").limit(1).execute()
    if not response.data:
        print("FAILURE: No users found.")
        return
    user_id = response.data[0]['id']

    # 2. Create Test Investor
    print("2. Creating Test Investor...")
    # Using the organization ID we just created: faa4fe1e-8c27-47f1-99ba-938a0679fd0c
    investor_data = {
        "first_name": "Equity",
        "last_name": "King",
        "email": "equity@king.com",
        "type": "investor",
        "tags": ["Multifamily", "Value-Add"],
        "organization_id": "faa4fe1e-8c27-47f1-99ba-938a0679fd0c"
    }
    try:
        supabase.table("contacts").insert(investor_data).execute()
        print("   Investor 'Equity King' created.")
    except Exception as e:
        print(f"   Investor creation likely already exists or skipped: {e}")

    # 3. Create Test Deal
    print("3. Creating Test Deal...")
    deal_data = {
        "user_id": user_id,
        "project_name": "Capital Test Heights",
        "location": "Austin, TX",
        "asset_type": "Multifamily",
        "stage": "due_diligence",
        "acquisition_price": 7500000,
        "notes": "Needs capital."
    }
    response = supabase.table("deals").insert(deal_data).execute()
    deal_id = response.data[0]['id']
    print(f"   Created Deal ID: {deal_id}")

    # 4. Run Agents
    print("4. Running Agent Orchestrator...")
    try:
        process_deal(deal_id)
    except Exception as e:
        print(f"   Orchestrator Failed: {e}")

    # 5. Verify Output
    print("5. Verifying Output...")
    response = supabase.table("deals").select("notes").eq("id", deal_id).execute()
    notes = response.data[0]['notes']
    
    if "[Found Investor Matches]" in notes:
         print("SUCCESS: Orchestrator ran and included CRM Potential Matches!")
    else:
        print("FAILURE: Notes do not look right (Investor matches missing).")
        
    print("Full Notes:\n", notes)

if __name__ == "__main__":
    test_capital_raiser_agent()
