import requests
import json
import uuid

SUPABASE_URL = "https://ubdhpacoqmlxudcvhyuu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGhwYWNvcW1seHVkY3ZoeXV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MDM0MiwiZXhwIjoyMDg3MDM2MzQyfQ.V804xM_snbTsrrt8vPNjQ9bQNK-x-_kS5eXCGM-mFxo"

def test_insert_contact():
    # Test insertion with organization_id
    url = f"{SUPABASE_URL}/rest/v1/contacts"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    payload = {
        "first_name": "Test",
        "last_name": "Contact",
        "organization_id": "faa4fe1e-8c27-47f1-99ba-938a0679fd0c",
        "type": "investor",
        "status": "prospect"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 201:
            print("SUCCESS! Contact inserted with organization_id.")
            # Cleanup
            contact_id = response.json()[0]['id']
            requests.delete(f"{url}?id=eq.{contact_id}", headers=headers)
        else:
            print(f"ERROR {response.status_code}: {response.text}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_insert_contact()
