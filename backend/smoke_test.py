#!/usr/bin/env python3
"""
Smoke test for Axiom OS V5 backend.
Run: python smoke_test.py [base_url]
"""
import sys
import json
import urllib.request
import urllib.error

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

TESTS = [
    ("GET", "/health", None, 200),
    ("GET", "/market/intel", None, 200),
]

passed = 0
failed = 0

for method, path, body, expected_status in TESTS:
    url = f"{BASE_URL}{path}"
    try:
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, method=method)
        if data:
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
    except urllib.error.HTTPError as e:
        status = e.code
    except Exception as e:
        print(f"  FAIL {method} {path} — {e}")
        failed += 1
        continue

    if status == expected_status:
        print(f"  OK   {method} {path} → {status}")
        passed += 1
    else:
        print(f"  FAIL {method} {path} → {status} (expected {expected_status})")
        failed += 1

print(f"\n{passed} passed, {failed} failed")
sys.exit(0 if failed == 0 else 1)
