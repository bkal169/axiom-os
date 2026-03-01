import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def verify_scenarios():
    print("Verifying Scenarios Endpoint...")
    
    # Wait for server to be ready (assuming it's reloading)
    time.sleep(2)

    url = f"{BASE_URL}/properties/P-0001/scenarios"
    payload = {
        "ltc": 0.70,
        "interest_rate": 0.08,
        "hold_years": 5,
        "exit_cap_rate": 0.06
    }
    
    try:
        resp = requests.post(url, params=payload)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            scenarios = data.get("scenarios", {})
            print(f"Scenarios returned: {list(scenarios.keys())}")
            
            expected_keys = ["base", "rate_shock_+200bps", "noi_shock_-15pct", "exit_cap_shock_+100bps", "recession_combo"]
            missing = [k for k in expected_keys if k not in scenarios]
            
            if not missing:
                print("SUCCESS: All expected scenarios found.")
                # Print a key metric from base vs recession to show difference
                base_irr = scenarios["base"]["irr"]
                recession_irr = scenarios["recession_combo"]["irr"]
                print(f"Base IRR: {base_irr:.2%}")
                print(f"Recession IRR: {recession_irr:.2%}")
            else:
                print(f"FAILURE: Missing scenarios: {missing}")
        else:
            print(f"FAILURE: Unexpected status code {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"FAILURE: Exception {e}")

if __name__ == "__main__":
    verify_scenarios()
