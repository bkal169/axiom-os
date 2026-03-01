import requests
import json

BASE_URL = "http://127.0.0.1:8009"

def run_test():
    print("--- 1. SIGNUP (FREE Plan) ---")
    signup_payload = {
        "org_name": "Juniper Rose Labs",
        "email": "test@axiom.ai",
        "password": "test1234",
        "role": "SAAS"
    }
    try:
        res = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
        res.raise_for_status()
        data = res.json()
        token = data.get("token")
        print(f"Signup successful. Token: {token[:20]}...")
    except Exception as e:
        print(f"Signup failed: {e}")
        # Perhaps user already exists, let's try login
        print("--- 1b. LOGIN (Fallback) ---")
        login_payload = {"email": "test@axiom.ai", "password": "test1234"}
        res = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        data = res.json()
        token = data.get("token")
        if token:
            print(f"Login successful. Token: {token[:20]}...")
        else:
            print(f"Login failed: {data}")
            return

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 2. TEST /compare (Expect 403) ---")
    # Using real PIDs from store
    compare_url = f"{BASE_URL}/compare?pid1=P-0001&pid2=P-0002"
    res_compare = requests.post(compare_url, headers=headers)
    print(f"Response Code: {res_compare.status_code}")
    print(f"Response Body: {res_compare.text}")
    if res_compare.status_code == 403:
        print("SUCCESS: Comparison restricted for FREE plan.")
    else:
        print("FAILURE: Comparison should have been restricted.")

    print("\n--- 3. TEST /report (Expect 403) ---")
    report_url = f"{BASE_URL}/properties/P-0001/report"
    res_report = requests.post(report_url, headers=headers)
    print(f"Response Code: {res_report.status_code}")
    print(f"Response Body: {res_report.text}")
    if res_report.status_code == 403:
        print("SUCCESS: Report restricted for FREE plan.")
    else:
        print("FAILURE: Report should have been restricted.")

if __name__ == "__main__":
    run_test()
