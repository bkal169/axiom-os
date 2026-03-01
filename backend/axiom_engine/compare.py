from typing import Dict, Any, List
from .runlogic import run_deal_package

KEYS = [
    "irr",
    "cash_on_cash_year1",
    "dscr_year1",
    "equity_multiple",
    "sale_price_est",
    "net_sale_to_equity_est",
    "debt_service_annual",
    "ending_loan_balance_est",
]

def _num_from_fmt(val: Any) -> float:
    """
    Convert formatted values like '12.34%' or '$1,234,000' to numeric best-effort.
    """
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip()
    if s.endswith("%"):
        try:
            return float(s.replace("%","")) / 100.0
        except:
            return 0.0
    if s.startswith("$"):
        try:
            return float(s.replace("$","").replace(",",""))
        except:
            return 0.0
    try:
        return float(s)
    except:
        return 0.0

def compare_two(
    p1: Dict[str, Any],
    p2: Dict[str, Any],
    assumptions: Dict[str, Any],
    org_id: str | None = None,
) -> Dict[str, Any]:

    d1 = run_deal_package(property_row=p1, org_id=org_id, **assumptions)
    d2 = run_deal_package(property_row=p2, org_id=org_id, **assumptions)

    if "error" in d1 or "error" in d2:
        return {"error": "compare_failed", "deal1": d1, "deal2": d2}

    b1 = d1["scenarios"]["base"]
    b2 = d2["scenarios"]["base"]

    deltas = {}
    for k in KEYS:
        v1 = _num_from_fmt(b1.get(k))
        v2 = _num_from_fmt(b2.get(k))
        deltas[k] = v2 - v1

    return {
        "property_1": {"id": p1["id"], "address": p1["address"], "city": p1["city"], "state": p1["state"]},
        "property_2": {"id": p2["id"], "address": p2["address"], "city": p2["city"], "state": p2["state"]},
        "assumptions": assumptions,
        "deal_1_base": b1,
        "deal_2_base": b2,
        "delta_2_minus_1": deltas,
    }
