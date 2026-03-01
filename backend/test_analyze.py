import requests
import json

URL = "http://localhost:8001/copilot/analyze"
payload = {
    "deal_data": {
        "title": "Test Property",
        "price": 1000000,
        "noi": 50000
    },
    "user_notes": "Testing the new analyze endpoint wrapper."
}

try:
    print(f"Sending request to {URL}...")
    resp = requests.post(URL, json=payload)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
except Exception as e:
    print(f"Error: {e}")
