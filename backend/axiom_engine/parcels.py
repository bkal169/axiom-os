import csv
import json
from pathlib import Path
from typing import Dict, Any, List, Optional

# Adjust base dir to point effectively to backend/
BASE_DIR = Path(__file__).resolve().parents[1]  # axiom_engine -> backend
PARCELS_PATH = BASE_DIR / "parcels.jsonl"

# Minimal "canonical" parcel fields we normalize into:
CANON = [
    "parcel_id", "site_address", "city", "state", "zip",
    "owner_name", "land_use", "zoning",
    "lot_sqft", "bldg_sqft", "year_built",
    "assessed_total", "last_sale_price", "last_sale_date",
    "lat", "lon", "county"
]

def _to_float(x: Any) -> float:
    try:
        s = str(x).replace("$", "").replace(",", "").strip()
        return float(s) if s else 0.0
    except:
        return 0.0

def _to_int(x: Any) -> int:
    try:
        return int(float(str(x).replace(",", "").strip()))
    except:
        return 0

def normalize_row(row: Dict[str, Any], mapping: Dict[str, str], defaults: Dict[str, Any]) -> Dict[str, Any]:
    out = {k: defaults.get(k) for k in CANON}

    # map CSV columns -> canon keys
    for canon_key, csv_col in mapping.items():
        val = row.get(csv_col)
        if val:
            out[canon_key] = val

    # casts
    out["lot_sqft"] = _to_float(out.get("lot_sqft"))
    out["bldg_sqft"] = _to_float(out.get("bldg_sqft"))
    out["year_built"] = _to_int(out.get("year_built"))
    out["assessed_total"] = _to_float(out.get("assessed_total"))
    out["last_sale_price"] = _to_float(out.get("last_sale_price"))

    return out

def ingest_csv(file_path: Path, mapping: Dict[str, str], defaults: Dict[str, Any]) -> Dict[str, Any]:
    count = 0
    # Ensure PARCELS_PATH parent exists? Backend dir should exist.
    
    # print(f"DEBUG: ingest_csv reading {file_path}")
    with open(file_path, newline="", encoding="utf-8", errors="ignore") as f, open(PARCELS_PATH, "a", encoding="utf-8") as out:
        reader = csv.DictReader(f)
        # print(f"DEBUG: CSV fieldnames: {reader.fieldnames}")
        for row in reader:
            # print(f"DEBUG: Processing row: {row}")
            rec = normalize_row(row, mapping, defaults)
            out.write(json.dumps(rec) + "\n")
            count += 1
    # print(f"DEBUG: Ingested {count} rows")
    return {"ok": True, "ingested": count, "parcels_path": str(PARCELS_PATH)}

def _read_all(limit: int = 50000) -> List[Dict[str, Any]]:
    if not PARCELS_PATH.exists():
        return []
    rows = []
    with open(PARCELS_PATH, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= limit:
                break
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows

def search_parcels(
    state: Optional[str] = None,
    county: Optional[str] = None,
    min_lot_sqft: Optional[float] = None,
    min_bldg_sqft: Optional[float] = None,
    land_use: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    data = _read_all()
    ql = (q or "").lower().strip()

    def ok(p: Dict[str, Any]) -> bool:
        if state and (p.get("state") or "").lower() != state.lower():
            return False
        if county and (p.get("county") or "").lower() != county.lower():
            return False
        if min_lot_sqft is not None and float(p.get("lot_sqft") or 0) < min_lot_sqft:
            return False
        if min_bldg_sqft is not None and float(p.get("bldg_sqft") or 0) < min_bldg_sqft:
            return False
        if land_use and land_use.lower() not in (p.get("land_use") or "").lower():
            return False
        if ql:
            blob = " ".join([
                str(p.get("parcel_id","")),
                str(p.get("site_address","")),
                str(p.get("owner_name","")),
                str(p.get("zoning","")),
                str(p.get("land_use","")),
                str(p.get("city","")),
            ]).lower()
            if ql not in blob:
                return False
        return True

    results = [p for p in data if ok(p)]
    return {"count": len(results), "results": results[: max(1, min(limit, 200))]}



def get_parcel_by_id(parcel_id: str) -> Optional[Dict[str, Any]]:
    parcel_id = (parcel_id or "").strip()
    if not parcel_id:
        return None
    for p in _read_all():
        if str(p.get("parcel_id")) == parcel_id:
            return p
    return None
