import requests
from typing import Dict, Any

CENSUS_BASE = "https://api.census.gov/data/2022/acs/acs5"

def get_demographics(state_fips: str = "12") -> Dict[str, Any]:
    """
    Default = Florida (12).
    Pull:
    - Total population
    - Median household income
    - 65+ population
    """
    params = {
        "get": "B01003_001E,B19013_001E,B01001_020E",
        "for": f"state:{state_fips}"
    }

    try:
        r = requests.get(CENSUS_BASE, params=params, timeout=5)
        if r.status_code != 200:
            print(f"Census Error {r.status_code}: {r.text}")
            return _census_fallback()

        data = r.json()
        if len(data) < 2:
            return _census_fallback()
            
        headers = data[0]
        values = data[1]
        result = dict(zip(headers, values))

        return {
            "population_total": int(result.get("B01003_001E", 0)),
            "median_household_income": int(result.get("B19013_001E", 0)),
            "population_65_plus_male": int(result.get("B01001_020E", 0)),
            "source": "census_api"
        }
    except Exception as e:
        print(f"Census Exception: {e}")
        return _census_fallback()

def _census_fallback():
    return {
        "population_total": 22244823, # FL 2022 est
        "median_household_income": 69303,
        "population_65_plus_male": 2300000,
        "source": "fallback"
    }
