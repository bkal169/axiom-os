import requests
import os

SUPABASE_URL = "https://ubdhpacoqmlxudcvhyuu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGhwYWNvcW1seHVkY3ZoeXV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MDM0MiwiZXhwIjoyMDg3MDM2MzQyfQ.V804xM_snbTsrrt8vPNjQ9bQNK-x-_kS5eXCGM-mFxo"

def check_crm_schema():
    # Attempt to fetch a contact with the new columns
    url = f"{SUPABASE_URL}/rest/v1/contacts?select=id,max_check_size&limit=1"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print("SUCCESS! 'contacts' table updated with 'max_check_size'!")
        else:
            print(f"ERROR {response.status_code}: {response.text}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    check_crm_schema()
