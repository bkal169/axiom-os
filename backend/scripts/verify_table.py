import requests
import os

SUPABASE_URL = "https://ubdhpacoqmlxudcvhyuu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGhwYWNvcW1seHVkY3ZoeXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjAzNDIsImV4cCI6MjA4NzAzNjM0Mn0.2qZBBWis2GUarglN6Lv2OuHpkfdQTkV25m20p3bjOwQ"

def check_deals_table():
    url = f"{SUPABASE_URL}/rest/v1/deals?select=*"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print("SUCCESS! Table 'deals' exists!")
            print(f"Count: {len(response.json())}")
        else:
            print(f"ERROR {response.status_code}: {response.text}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    check_deals_table()
