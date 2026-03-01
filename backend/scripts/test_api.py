import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("Testing /health...")
    resp = requests.get(f"{BASE_URL}/health")
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
    print("Health check passed.\n")

def test_copilot_interpret():
    print("Testing /copilot/interpret...")
    text = "Purchase price $1M, 70% LTC, 5% rate"
    resp = requests.post(f"{BASE_URL}/copilot/interpret", json={"text": text})
    print(f"Status: {resp.status_code}")
    print(f"Response: {json.dumps(resp.json(), indent=2)}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "model_deal"
    assert data["inputs"]["purchase_price"] == 1_000_000
    print("Interpret check passed.\n")

def test_copilot_run():
    print("Testing /copilot/run...")
    text = "Purchase price $1M, 70% LTC, 5% rate, 30 year amort"
    resp = requests.post(f"{BASE_URL}/copilot/run", json={"text": text})
    print(f"Status: {resp.status_code}")
    # print(f"Response: {json.dumps(resp.json(), indent=2)}") 
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data
    assert data["result"]["irr"] > 0
    print("Run check passed.\n")

if __name__ == "__main__":
    try:
        test_health()
        test_copilot_interpret()
        test_copilot_run()
        print("ALL TESTS PASSED")
    except Exception as e:
        print(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
