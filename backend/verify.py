import urllib.request
import json

url = "http://127.0.0.1:8009/properties/P-0001/execute_deal"
payload = {
    "ltc": 0.85,
    "interest_rate": 0.05
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as f:
        res = json.loads(f.read().decode('utf-8'))
        print("Response LTC:", res['assumptions']['ltc'])
        if res['assumptions']['ltc'] == 0.85:
            print("SUCCESS: Endpoint accepted payload")
        else:
            print("FAILURE: Endpoint ignored payload")
except Exception as e:
    print(f"Error: {e}")
