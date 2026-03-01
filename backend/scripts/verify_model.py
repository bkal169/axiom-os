import requests
import json
import time

BASE_URL = "http://127.0.0.1:8002"

def check_health():
    print(f"Checking health at {BASE_URL}/health...")
    try:
        resp = requests.get(f"{BASE_URL}/health")
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")
        if resp.status_code != 200:
             print("HEALTH CHECK FAILED")
             return False
        return True
    except Exception as e:
        print(f"Health check error: {e}")
        return False

def verify_model():
    if not check_health():
        return

    print("Verifying Property Model (P-0001)...")
    url = f"{BASE_URL}/properties/P-0001/model"
    # Query params as per request
    params = {
        "ltc": 0.70,
        "interest_rate": 0.08,
        "hold_years": 5,
        "exit_cap_rate": 0.06,
        "amort_years": 30
    }
    
    try:
        print(f"POSTing to {url} with params {params}")
        resp = requests.post(url, params=params)
        print(f"Final URL: {resp.url}")
        print(f"Status: {resp.status_code}")
        print(f"Headers: {resp.headers}")
        
        if resp.status_code == 200:
            data = resp.json()
            res = data.get("result", {})
            keys = ["cap_rate_year1", "irr", "equity_multiple"]
            missing = [k for k in keys if k not in res]
            
            if not missing:
                print("SUCCESS: All financial metrics returned.")
            else:
                print(f"FAILURE: Missing metrics: {missing}")
        else:
            print(f"FAILURE: Unexpected status code {resp.status_code}")
            print(f"Body: {resp.text}")
            
    except Exception as e:
        print(f"ERROR: {e}")
    print("-" * 20)

if __name__ == "__main__":
    time.sleep(1) # Give server a moment
    verify_model()
