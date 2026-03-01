import requests
import time
import sys
import subprocess

BASE_URL = "http://127.0.0.1:8000"

def wait_for_server(timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            requests.get(f"{BASE_URL}/health")
            return
        except requests.ConnectionError:
            time.sleep(1)
    print("Server failed to start.")
    sys.exit(1)

def verify_model_endpoint():
    print("Waiting for server...")
    wait_for_server()
    
    print("Verifying GET request to /properties/P-0001/model...")
    params = {
        "ltc": 0.70,
        "interest_rate": 0.08,
        "hold_years": 5,
        "exit_cap_rate": 0.06,
        "amort_years": 30
    }
    
    try:
        resp = requests.get(f"{BASE_URL}/properties/P-0001/model", params=params)
        print(f"Status Code: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print("Response Data:", data)
            if "result" in data and "irr" in data["result"]:
                print("SUCCESS: Endpoint works as expected.")
            else:
                print("FAILURE: parsed JSON invalid structure.")
        elif resp.status_code == 405:
            print("FAILURE: Method Not Allowed (likely still POST).")
        else:
            print(f"FAILURE: Unexpected status code {resp.status_code}")
            print(resp.text)

    except Exception as e:
        print(f"FAILURE: Exception occurred: {e}")

if __name__ == "__main__":
    verify_model_endpoint()
