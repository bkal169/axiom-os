import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_user_case():
    print("Testing User Case...")
    payload = {
        "text": "Model a $4.2M deal at 70% LTC, 8% interest, amort 30, 5-year hold, exit cap 6%, NOI 320k"
    }
    
    # Test Interpret
    print("  -> /copilot/interpret")
    resp_interpret = requests.post(f"{BASE_URL}/copilot/interpret", json=payload)
    print(f"Status: {resp_interpret.status_code}")
    print(f"Response: {json.dumps(resp_interpret.json(), indent=2)}")
    
    assert resp_interpret.status_code == 200
    interp_data = resp_interpret.json()
    assert interp_data["inputs"]["purchase_price"] == 4_200_000
    assert interp_data["inputs"]["ltc"] == 0.70
    assert interp_data["inputs"]["interest_rate"] == 0.08
    assert interp_data["inputs"]["noi_year1"] == 320_000
    
    # Test Run
    print("  -> /copilot/run")
    resp_run = requests.post(f"{BASE_URL}/copilot/run", json=payload)
    print(f"Status: {resp_run.status_code}")
    print(f"Response: {json.dumps(resp_run.json(), indent=2)}")
    
    assert resp_run.status_code == 200
    run_data = resp_run.json()
    assert "result" in run_data
    print("User Case Passed.\n")

if __name__ == "__main__":
    try:
        # Wait for server to potentially start if run immediately after restart
        time.sleep(2) 
        test_user_case()
    except Exception as e:
        print(f"TEST FAILED: {e}")
