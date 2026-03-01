from typing import Dict, Any

def infer_asset_class(p: Dict[str, Any]) -> str:
    z = (p.get("zoning") or "").lower()
    u = (p.get("land_use") or "").lower()

    if "ind" in z or "industrial" in u:
        return "industrial"
    if "mf" in z or "multi" in u or "rmf" in z:
        return "multifamily"
    if "retail" in u:
        return "retail"
    if "office" in u:
        return "office"
    if "mixed" in z or "mu" in z or "mixed" in u:
        return "mixed_use"
    return "land"

def parcel_to_property(
    p: Dict[str, Any],
    assessed_multiplier: float = 1.35,
    assumed_cap_rate: float = 0.065
) -> Dict[str, Any]:
    assessed = float(p.get("assessed_total") or 0.0)
    ask_price = assessed * assessed_multiplier if assessed > 0 else 0.0

    asset_class = infer_asset_class(p)

    # NOI estimate only if there is building square footage OR non-land use
    noi = 0.0
    if ask_price > 0 and asset_class != "land":
        noi = ask_price * assumed_cap_rate

    return {
        "id": f"PARCEL::{p.get('parcel_id')}",
        "address": p.get("site_address"),
        "city": p.get("city"),
        "state": p.get("state"),
        "zip": p.get("zip"),
        "asset_class": asset_class,
        "sqft": float(p.get("bldg_sqft") or 0.0),
        "lot_size": float(p.get("lot_sqft") or 0.0) / 43560.0,  # acres
        "year_built": int(p.get("year_built") or 0),
        "zoning_code": p.get("zoning"),
        "status": "parcel_candidate",
        "ask_price": ask_price,
        "noi_year1": noi,
        "market": p.get("city"),
        "county": p.get("county"),
        "_source": "parcel",
        "_assumptions": {
            "assessed_multiplier": assessed_multiplier,
            "assumed_cap_rate": assumed_cap_rate
        }
    }
