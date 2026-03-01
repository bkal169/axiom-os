import csv
from pathlib import Path
from typing import List, Dict, Any, Optional
from functools import lru_cache

# Adjust to correct relative path based on file location
# File is at: axiom/backend/axiom_engine/store.py
# Base should be: axiom/
BASE_DIR = Path(__file__).resolve().parents[2] 
DATA_PATH = BASE_DIR / "data" / "properties_seed.csv"

def _to_float(val: str) -> float:
    return float(val) if val else 0.0

def _to_int(val: str) -> int:
    try:
        return int(float(val)) if val else 0
    except ValueError:
        return 0

def _read_csv(path: Path) -> List[Dict[str, Any]]:
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = []
        for r in reader:
            r["sqft"] = _to_float(r.get("sqft", ""))
            r["lot_size"] = _to_float(r.get("lot_size", ""))
            r["year_built"] = _to_int(r.get("year_built", ""))
            r["ask_price"] = _to_float(r.get("ask_price", ""))
            r["noi_year1"] = _to_float(r.get("noi_year1", ""))
            rows.append(r)
        return rows

@lru_cache(maxsize=1)
def load_properties() -> tuple:
    """Load properties from CSV, cached after first call. Returns tuple for hashability."""
    if not DATA_PATH.exists():
        alt_path = Path(__file__).resolve().parents[3] / "data" / "properties_seed.csv"
        if alt_path.exists():
             return tuple(_read_csv(alt_path))
        raise FileNotFoundError(f"Seed dataset not found at: {DATA_PATH}")
    return tuple(_read_csv(DATA_PATH))

def _get_properties_list() -> List[Dict[str, Any]]:
    """Convenience wrapper that returns a list from the cached tuple."""
    return list(load_properties())

def get_property_by_id(pid: str) -> Optional[Dict[str, Any]]:
    pid = pid.strip()
    for p in load_properties():
        if p["id"] == pid:
            return p
    return None

def search_properties(
    state: Optional[str] = None,
    asset_class: Optional[str] = None,
    min_sqft: Optional[float] = None,
    max_sqft: Optional[float] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> List[Dict[str, Any]]:
    props = load_properties()

    def ok(p: Dict[str, Any]) -> bool:
        if state and p["state"].lower() != state.lower():
            return False
        if asset_class and p["asset_class"].lower() != asset_class.lower():
            return False
        if min_sqft is not None and p["sqft"] < min_sqft:
            return False
        if max_sqft is not None and p["sqft"] > max_sqft:
            return False
        if min_price is not None and p["ask_price"] < min_price:
            return False
        if max_price is not None and p["ask_price"] > max_price:
            return False
        return True

    return [p for p in props if ok(p)]

