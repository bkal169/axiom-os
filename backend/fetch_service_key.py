import requests

PROJECT_REF = "ubdhpacoqmlxudcvhyuu"
ACCESS_TOKEN = "sbp_f575f09e19fd54172a6a7d20a784e34231999ad2"

def get_key():
    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys"
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        print(f"Error: {r.text}")
        return
    
    keys = r.json()
    service_key = next((k["api_key"] for k in keys if k["name"] == "service_role"), None)
    print(f"SERVICE_KEY={service_key}")

if __name__ == "__main__":
    get_key()
