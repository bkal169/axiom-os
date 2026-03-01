import requests
import json
import sys
import os
import time

BASE_URL = "http://127.0.0.1:8009"

# Default mapping provided by user
DEFAULT_MAPPING = {
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

def get_admin_token():
    # Helper to get a token. In prod, use your real login.
    # Here we simulate logging in as the admin user we created or a new one.
    # Attempt login first
    email = "admin_ingest@axiom.ai"
    password = "password123"
    
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        if res.status_code == 200:
            return res.json()["token"]
    except:
        pass

    # If login fails, create user and upgrade
    print("Creating admin user for ingestion...")
    email = f"admin_{int(time.time())}@axiom.ai"
    res = requests.post(f"{BASE_URL}/auth/signup", json={
        "org_name": "Ingestion Corp",
        "email": email,
        "password": password
    })
    res.raise_for_status()
    data = res.json()
    org_id = data["org"]["id"]
    
    # Upgrade to PRO to allow ingest
    requests.post(f"{BASE_URL}/admin/set_plan", json={
        "org_id": org_id,
        "plan": "PRO",
        "admin_secret": "CHANGE_ME_ADMIN"
    }).raise_for_status()
    
    return data["token"]

def ingest(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Ingesting {file_path}...")
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "text/csv")}
        data = {
            "mapping": json.dumps(DEFAULT_MAPPING["mapping"]),
            "defaults": json.dumps(DEFAULT_MAPPING["defaults"])
        }
        res = requests.post(f"{BASE_URL}/parcels/ingest", headers=headers, files=files, data=data)
        
        if res.status_code == 200:
            print("Success:", res.json())
        else:
            print("Failed:", res.status_code, res.text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest_csv.py <path_to_csv>")
    else:
        ingest(sys.argv[1])
