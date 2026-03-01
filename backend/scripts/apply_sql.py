import requests
import os

# Configuration
PROJECT_REF = "ubdhpacoqmlxudcvhyuu"
# User provided token
ACCESS_TOKEN = "sbp_f575f09e19fd54172a6a7d20a784e34231999ad2"
# Default file path
SQL_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'supabase', 'fix_missing_tables.sql')

def run_sql():
    print(f"Reading SQL from {SQL_FILE_PATH}...")
    try:
        with open(SQL_FILE_PATH, 'r') as f:
            sql_query = f.read()
    except FileNotFoundError:
        print("Error: SQL file not found.")
        return

    # Step 1: Get Service Role Key
    print("Fetching Service Role Key...")
    keys_url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys"
    headers_mgmt = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        resp_keys = requests.get(keys_url, headers=headers_mgmt)
        if resp_keys.status_code != 200:
            print(f"ERROR fetching keys {resp_keys.status_code}: {resp_keys.text}")
            return
            
        keys_data = resp_keys.json()
        service_key = next((k["api_key"] for k in keys_data if k["name"] == "service_role"), None)
        
        if not service_key:
            print("ERROR: Service Role Key not found.")
            return
        
        print("Service Key found.")
        
    except Exception as e:
        print(f"EXCEPTION fetching keys: {e}")
        return

    # Step 2: Execute SQL via Management API
    print("Executing SQL via Management API...")
    # The correct management API endpoint for SQL is:
    # POST https://api.supabase.com/v1/projects/{project_ref}/database/query
    meta_url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"
    headers_meta = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {"query": sql_query}

    try:
        response = requests.post(meta_url, json=payload, headers=headers_meta)
        
        if response.status_code == 200 or response.status_code == 201:
            print("SUCCESS! SQL executed.")
            # print("Response:", response.json()) # Verbose
        else:
            print(f"ERROR executing SQL {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"EXCEPTION executing SQL: {e}")

if __name__ == "__main__":
    run_sql()
