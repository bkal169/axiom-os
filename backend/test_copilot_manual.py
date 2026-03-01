import requests
import json

URL = "http://localhost:8001/copilot/analyze"

payload = {
    "deal_data": {
        "address": "123 Main St",
        "price": 500000,
        "noi": 30000
    },
    "user_notes": "Is this a good deal?"
}

try:
    # 1. Health
    print(f"Testing /health...")
    r = requests.get("http://localhost:8001/health")
    print(f"Health Status: {r.status_code}")

    # 2. Existing Route
    print(f"Testing /copilot/interpret...")
    r = requests.post("http://localhost:8001/copilot/interpret", json={"text": "buy for 1M"})
    print(f"Interpret Status: {r.status_code}")
    print(f"Interpret Response: {r.text}")

    # 3. New Route
    print(f"Sending request to {URL}...")
    r = requests.post(URL, json=payload)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Request failed: {e}")
