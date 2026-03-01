import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def verify_search():
    print("Verifying Search (FL > 20k sqft)...")
    url = f"{BASE_URL}/properties/search"
    params = {"state": "FL", "min_sqft": 20000}
    try:
        resp = requests.get(url, params=params)
        print(f"URL: {resp.url}")
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"Count: {data.get('count')}")
            results = data.get("results", [])
            ids = [p["id"] for p in results]
            print(f"IDs found: {ids}")
            
            expected = ["P-0002", "P-0003", "P-0005", "P-0007", "P-0008"]
            missing = [eid for eid in expected if eid not in ids]
            
            if not missing:
                print("SUCCESS: All expected properties found.")
            else:
                print(f"FAILURE: Missing expected properties: {missing}")
        else:
            print(f"FAILURE: Unexpected status code {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"ERROR: {e}")
    print("-" * 20)

def verify_get_by_id():
    print("Verifying Get by ID (P-0002)...")
    try:
        resp = requests.get(f"{BASE_URL}/properties/P-0002")
        print(f"URL: {resp.url}")
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            p = resp.json()
            print(f"ID: {p.get('id')}")
            print(f"Address: {p.get('address')}")
            if p.get("id") == "P-0002":
                print("SUCCESS: Retrieved correct property.")
            else:
                 print("FAILURE: ID mismatch.")
        else:
            print(f"FAILURE: Unexpected status code {resp.status_code}")
            print(resp.text)

    except Exception as e:
        print(f"ERROR: {e}")
    print("-" * 20)

if __name__ == "__main__":
    verify_search()
    verify_get_by_id()
