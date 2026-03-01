import requests
import json
import time

BASE_URL = "http://127.0.0.1:8009"

def verify_flow():
    print("--- 1. Authenticate as PRO ---")
    # 1. Signup/Login
    email = "pro_user_v2@axiom.ai"
    password = "password123"
    
    # Try login first
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        print("Logged in.")
        token = r.json()["token"]
    else:
        # Signup
        print("Signing up...")
        r = requests.post(f"{BASE_URL}/auth/signup", json={
            "org_name": "Pro Capital V2",
            "email": email,
            "password": password,
            "role": "SAAS"
        })
        if r.status_code != 200:
            print("Auth Failed:", r.text)
            return
        token = r.json()["token"]

    headers = {"Authorization": f"Bearer {token}"}
    print("Authenticated.")

    # Upgrade to PRO (via Admin)
    # Get Org ID from token (or just trust me)
    # We need to know ORG ID.
    # r.json() has "user" and "org"
    org_id = r.json()["org"]["id"]
    
    print(f"Upgrading Org {org_id} to PRO...")
    requests.post(f"{BASE_URL}/admin/set_plan", json={
        "org_id": org_id,
        "plan": "PRO",
        "admin_secret": "CHANGE_ME_ADMIN"
    })

    print("--- 2. Ingest CSV ---")
    # Create a dummy CSV
    csv_content = """parcel_id,address,city,state,zip,lot_sqft,bldg_sqft,zoning,land_use,assessed,market_val,owner
1001,123 Main St,Tampa,FL,33602,50000,20000,IND,Industrial,1000000,1500000,ABC Corp
2001,456 Ind Blvd,Tampa,FL,33602,100000,40000,IND,Industrial,2000000,3500000,XYZ LLC
3001,789 Res Rd,Tampa,FL,33602,10000,2500,RES,Single Family,300000,500000,John Doe
"""
    files = {
        "file": ("temp_parcels.csv", csv_content, "text/csv")
    }
    data = {"mapping": json.dumps({
        "parcel_id": "parcel_id",
        "site_address": "address",
        "city": "city",
        "state": "state",
        "zip": "zip",
        "lot_sqft": "lot_sqft",
        "bldg_sqft": "bldg_sqft",
        "zoning": "zoning",
        "land_use": "land_use",
        "assessed_total": "assessed",
        "owner_name": "owner"
    })}
    
    res = requests.post(f"{BASE_URL}/parcels/ingest", headers=headers, files=files, data=data)
    print("Ingest Result:", res.json())
    if res.status_code != 200:
        return

    print("\n--- 3. Search Scored ---")
    # Search Scored
    params = {
        "state": "FL",
        "land_use": "Industrial",
        "min_score": 50,
        "limit": 5
    }
    res = requests.get(f"{BASE_URL}/parcels/search_scored", headers=headers, params=params)
    print("Search Status:", res.status_code)
    results = res.json().get("results", [])
    print(f"Found {len(results)} parcels.")
    
    if not results:
        print("No results found. Exiting.")
        return

    pid = results[0]["parcel_id"]
    score = results[0]["_score"]["score"]
    print(f"Selected Parcel: {pid} | Score: {score}")

    print("\n--- 4. Run Underwriting ---")
    # POST /parcels/{parcel_id}/run
    
    query_params = {
        "assessed_multiplier": 1.4,
        "assumed_cap_rate": 0.07,
    }
    
    body_payload = {
        "ltc": 0.70,
        "interest_rate": 0.08, # Changed to float match
        "amort_years": 30,
        "hold_years": 5,
        "noi_growth": 0.02,
        "exit_cap_rate": 0.06, # Changed to match expectation
        "sale_cost_pct": 0.03,
        "purchase_price_override": 0.0,
        "noi_year1_override": 0.0,
        "capex_override": 0.0,
        "vacancy_override": -1.0
    }
    
    res = requests.post(f"{BASE_URL}/parcels/{pid}/run", headers=headers, params=query_params, json=body_payload)
    print("Run Status:", res.status_code)
    if res.status_code == 200:
        deal = res.json()
        # Verify structure
        if "deal" in deal:
            print("Deal Summary:")
            print(deal["deal"]["summary"])
            print(f"IRR: {deal['deal']['scenarios']['base']['irr']}")
            print(f"Equity Multiple: {deal['deal']['scenarios']['base']['equity_multiple']}")
        else:
             print("Deal structure mismatch:", deal.keys())
    else:
        print("Run Failed:", res.text)

if __name__ == "__main__":
    verify_flow()
