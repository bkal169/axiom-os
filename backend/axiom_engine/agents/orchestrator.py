import os
import json
from supabase import create_client, Client
from axiom_engine.brain import call_llm
from axiom_engine.agents import personas
from axiom_engine.connectors.rates import get_10yr_treasury
from axiom_engine.tools.market import get_location_intel
from axiom_engine.tools.crm import find_matching_investors
from axiom_engine.tools.finance import generate_fiscal_plan_text
# from axiom_engine.connectors.census import get_census_data # skip for now to simplify dependencies

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = None

if url and key:
    supabase = create_client(url, key)

def process_deal(deal_id: str):
    """
    Orchestrates the Multi-Agent analysis for a single deal.
    """
    if not supabase:
        print("Error: Supabase credentials missing. Cannot process deal.")
        return

    print(f"DEBUG: [Orchestrator] Processing Deal {deal_id}")
    
    # 1. Fetch Deal
    try:
        response = supabase.table("deals").select("*").eq("id", deal_id).execute()
        if not response.data:
            print(f"Deal {deal_id} not found")
            return
        deal = response.data[0]
    except Exception as e:
        print(f"Error fetching deal: {e}")
        return

    # Check if already processed
    if "** Investment Committee Memo **" in (deal.get("notes") or ""):
        print(f"Deal {deal_id} already processed. Skipping.")
        return

    # 2. Fetch Market Data & Context
    treasury_rate = get_10yr_treasury()
    location_str = deal.get('location', '')
    
    # Parse city/state from location "City, ST" if possible
    city, state = "", ""
    if "," in location_str:
        parts = location_str.split(",")
        if len(parts) >= 2:
            city = parts[0].strip()
            state = parts[1].strip()
    
    # Tool: Get Saved Intel
    saved_intel = get_location_intel(supabase, city, state)

    # Tool: Fiscal Plan (New)
    fiscal_plan = generate_fiscal_plan_text(deal)

    # 3. Agent Loop (Sequential for MVP)
    
    # Market Researcher
    print("  -> Agent: Market Researcher")
    market_prompt = f"Deal Location: {location_str}. Current 10yr Treasury: {treasury_rate}%. \n\n" \
                    f"Saved Market Intelligence:\n{saved_intel}\n\n" \
                    f"Research the market drivers for this location. Incorporate the saved intel if relevant."
    
    print(f"DEBUG: Market Prompt:\n{market_prompt}")
    market_report = call_llm(personas.MARKET_RESEARCHER, market_prompt, json_mode=False)
    
    # Common Context for specialized agents
    deal_context = f"Deal Data: {json.dumps(deal, indent=2)}\n\nMarket Report:\n{market_report}\n\nFiscal Plan:\n{fiscal_plan}"

    # Valuator
    print("  -> Agent: Valuator")
    val_report = call_llm(personas.VALUATOR, deal_context, json_mode=False)
    
    # Tool: Renovation Estimates
    from axiom_engine.tools.renovation import estimate_renovation_costs
    # MVP: Default to 50 units if unknown
    reno_estimates = estimate_renovation_costs(deal.get("asset_type", "Multifamily"), units=50)

    # Strategist
    print("  -> Agent: Strategist")
    strat_context = f"{deal_context}\n\nExisting Value: {val_report}\n\nRenovation Benchmarks:\n{reno_estimates}"
    print(f"DEBUG: Strategist Context:\n{strat_context}")
    strat_report = call_llm(personas.STRATEGIST, strat_context, json_mode=False)
    
    # Risk Officer
    print("  -> Agent: Risk Officer")
    # Tool: Fetch Leases
    rent_roll_str = "## Rent Roll / Leasing:\n"
    try:
        leases_response = supabase.table("leases").select("*, tenants(*)").eq("deal_id", deal_id).execute()
        leases = leases_response.data or []
        
        if not leases:
            rent_roll_str += "No active leases or pipeline reported."
        else:
            for l in leases:
                rent_roll_str += f"- {l.get('tenants', {}).get('name')}: {l.get('sqft')} sqft @ ${l.get('annual_rent')}/yr (Exp: {l.get('end_date')}) [{l.get('status')}]\n"
    except Exception as e:
        print(f"   Note: Could not fetch leases (table might be missing): {e}")
        rent_roll_str += "Leasing profile unavailable (database connection pending)."

    risk_context = f"{deal_context}\n\nTenant Profile:\n{rent_roll_str}"
    risk_report = call_llm(personas.RISK_OFFICER, risk_context, json_mode=False)
    
    # Capital Raiser (Equity)
    print("  -> Agent: Capital Raiser (Equity)")
    # Tool: Find Investors
    investor_matches = "CRM matching unavailable."
    try:
        investor_matches = find_matching_investors(supabase, deal)
    except Exception as e:
        print(f"   Note: Investor match failed (check CRM schema): {e}")

    cap_context = f"{deal_context}\n\nPotential Investors:\n{investor_matches}"
    print(f"DEBUG: Capital Raiser Context:\n{cap_context}")
    cap_report = call_llm(personas.CAPITAL_RAISER, cap_context, json_mode=False)

    # Debt Capital Markets (New)
    print("  -> Agent: Debt Capital Markets")
    from axiom_engine.tools.debt import find_matching_lenders
    lender_matches = "Debt marketplace matching unavailable."
    try:
        lender_matches = find_matching_lenders(supabase, deal)
    except Exception as e:
        print(f"   Note: Lender match failed (check CRM schema): {e}")

    debt_context = f"{deal_context}\n\nPotential Lender Matches:\n{lender_matches}"
    debt_report = call_llm(personas.DEBT_CAPITAL, debt_context, json_mode=False)
    
    # Legal
    print("  -> Agent: Legal")
    # Tool: Zoning Analysis
    from axiom_engine.tools.zoning import analyze_zoning
    zoning_code = "Unknown"
    site_sqft = 43560 # Default 1 acre
    
    for tag in deal.get("tags", []):
        if "sqft" in tag.lower():
            try:
                site_sqft = float(''.join(filter(str.isdigit, tag)))
            except: pass
        if tag.upper() in ["T6-8", "MU-3", "RM-1", "CG", "IL"]:
            zoning_code = tag.upper()

    zoning_analysis = analyze_zoning(zoning_code, site_sqft)
    legal_context = f"{deal_context}\n\nAutomated Zoning Analysis:\n{zoning_analysis}"
    legal_report = call_llm(personas.LEGAL_COMPLIANCE, legal_context, json_mode=False)
    
    # Skeptic (Critique)
    print("  -> Agent: Skeptic")
    skeptic_context = f"Market:\n{market_report}\nValuation:\n{val_report}\nStrategy:\n{strat_report}\nEquity Capital:\n{cap_report}\nDebt Capital:\n{debt_report}\nRisk:\n{risk_report}\nLegal:\n{legal_report}"
    skeptic_report = call_llm(personas.SKEPTIC, skeptic_context, json_mode=False)
    
    # Analyst (Synthesizer)
    print("  -> Agent: Analyst (Final Memo)")
    analyst_context = f"Deal Data: {deal}\n\nTeam Reports:\n{skeptic_context}\n\nSkeptic Critique:\n{skeptic_report}"
    final_memo = call_llm(personas.ANALYST_WRITER, analyst_context, json_mode=False)
    
    # 4. Save Results
    formatted_note = f"\n\n---\n** Investment Committee Memo **\n{final_memo}\n---\n"
    current_notes = deal.get("notes") or ""
    new_notes = current_notes + formatted_note
    
    try:
        supabase.table("deals").update({"notes": new_notes}).eq("id", deal_id).execute()
        print(f"DEBUG: [Orchestrator] Deal {deal_id} analysis complete and saved.")
    except Exception as e:
        print(f"Error saving notes: {e}")
