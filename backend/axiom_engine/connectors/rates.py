import requests
import os

FRED_TREASURY_URL = "https://api.stlouisfed.org/fred/series/observations"

def get_10yr_treasury(api_key: str | None = None):
    # Try param first, then env var
    key = api_key or os.getenv("FRED_API_KEY")
    
    if not key:
        return {"source": "fallback", "treasury_10yr": 0.0425, "date": "2024-01-01"}

    params = {
        "series_id": "DGS10",
        "api_key": key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": 1
    }

    try:
        r = requests.get(FRED_TREASURY_URL, params=params, timeout=5)
        if r.status_code != 200:
            print(f"FRED Error {r.status_code}: {r.text}")
            return {"source": "fallback_error", "treasury_10yr": 0.0425, "date": "Error"}

        obs = r.json().get("observations", [])
        if not obs:
            return {"source": "fallback_empty", "treasury_10yr": 0.0425, "date": "No Data"}

        # value can be "." if market closed
        val_str = obs[0]["value"]
        if val_str == ".":
            return {"source": "fallback_closed", "treasury_10yr": 0.0425, "date": obs[0]["date"]}

        rate = float(val_str) / 100.0
        return {"source": "fred", "treasury_10yr": rate, "date": obs[0]["date"]}
        
    except Exception as e:
        print(f"FRED Exception: {e}")
        return {"source": "fallback_exception", "treasury_10yr": 0.0425, "date": "Error"}
