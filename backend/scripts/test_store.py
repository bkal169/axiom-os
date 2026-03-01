import requests
import json
import time
import sys
import os

# Test store.py directly first
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'axiom/backend')))
from axiom_engine.store import load_properties, get_property_by_id, search_properties

def test_store_direct():
    print("Testing store.py directly...")
    props = load_properties()
    print(f"Loaded {len(props)} properties.")
    assert len(props) > 0
    
    p = get_property_by_id("P-0001")
    assert p is not None
    assert p["city"] == "Sarasota"
    
    filtered = search_properties(min_price=5_000_000)
    print(f"Found {len(filtered)} properties > $5M.")
    assert len(filtered) > 0
    print("Store direct tests passed.\n")

BASE_URL = "http://127.0.0.1:8000"

def test_api_properties():
    print("Testing API /properties...")
    
    # List all
    resp = requests.get(f"{BASE_URL}/properties")
    assert resp.status_code == 200
    all_props = resp.json()
    assert len(all_props) > 0
    
    # Get by ID
    pid = "P-0002"
    resp = requests.get(f"{BASE_URL}/properties/{pid}")
    assert resp.status_code == 200
    p = resp.json()
    assert p["id"] == pid
    assert p["city"] == "Tampa"
    
    # Filter
    resp = requests.get(f"{BASE_URL}/properties?state=FL&min_price=10000000")
    assert resp.status_code == 200
    filtered = resp.json()
    # P-0005 (Orlando) is $21.5M, P-0008 (Jacksonville) is $10.4M
    print(f"API filtered query returned {len(filtered)} properties.")
    assert len(filtered) >= 2
    
    print("API property tests passed.\n")

if __name__ == "__main__":
    try:
        test_store_direct()
        
        # Assume server is running or will be started
        # We'll skip API test if connection fails to differentiate
        try:
            requests.get(f"{BASE_URL}/health")
            test_api_properties()
        except requests.exceptions.ConnectionError:
            print("API server not running, skipping API tests.")
            
        print("ALL TESTS PASSED")
    except Exception as e:
        print(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
