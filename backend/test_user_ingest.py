import requests
import json
import time
from pathlib import Path

BASE_URL = "http://127.0.0.1:8009"
CSV_FILE = "dummy_user_parcels.csv"

# User provided mapping
MAPPING = {
  "mapping": {
    "parcel_id": "PARCEL_ID",
    "site_address": "SITE_ADDR",
    "city": "CITY",
    "state": "STATE",
    "zip": "ZIP",
    "owner_name": "OWNER",
    "land_use": "LAND_USE",
    "zoning": "ZONING",
    "lot_sqft": "LOT_SQFT",
    "bldg_sqft": "BLDG_SQFT",
    "year_built": "YR_BUILT",
    "assessed_total": "ASSESSED",
    "last_sale_price": "LAST_SALE",
    "last_sale_date": "SALE_DATE",
    "county": "COUNTY"
  },
  "defaults": {
    "state": "FL"
  }
}

def get_pro_token():
    # Login as the pro user we created earlier
    # We'll validat credentials or create a new one to be safe/fast
    email = f"user_ingest_{int(time.time())}@axiom.ai"
    res = requests.post(f"{BASE_URL}/auth/signup", json={
        "org_name": "User Data Corp",
        "email": email,
        "password": "password123"
    })
    res.raise_for_status()
    data = res.json()
    token = data["token"]
    org_id = data["org"]["id"]
    
    # Upgrade
    res = requests.post(f"{BASE_URL}/admin/set_plan", json={
        "org_id": org_id,
        "plan": "PRO",
        "admin_secret": "CHANGE_ME_ADMIN"
    })
    res.raise_for_status()
    return token

def run_ingest():
    token = get_pro_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Ingesting {CSV_FILE} with user mapping...")
    with open(CSV_FILE, "rb") as f:
        files = {"file": (CSV_FILE, f, "text/csv")}
        data = {
            "mapping": json.dumps(MAPPING["mapping"]),
            "defaults": json.dumps(MAPPING["defaults"])
        }
        res = requests.post(f"{BASE_URL}/parcels/ingest", headers=headers, files=files, data=data)
        if res.status_code != 200:
            print("Failed:", res.text)
        res.raise_for_status()
        print("Success:", res.json())

    # Verify search
    print("Verifying search...")
    res = requests.get(f"{BASE_URL}/parcels/search", headers=headers, params={"q": "User Corp"})
    print("Search Results:", res.json())

if __name__ == "__main__":
    run_ingest()
