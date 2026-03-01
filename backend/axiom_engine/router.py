import re
from typing import Dict, Any, Optional
from .store import search_properties
from .copilot import interpret

ASSET_CLASSES = ["multifamily", "retail", "industrial", "office", "mixed_use", "land"]

def _find_asset_class(text: str) -> Optional[str]:
    t = text.lower()
    for a in ASSET_CLASSES:
        if a in t:
            return a
    return None

def _find_state(text: str) -> Optional[str]:
    t = text.lower()
    if " florida" in t or " fl" in t:
        return "FL"
    if " north carolina" in t or " nc" in t:
        return "NC"
    return None

def _find_min_sqft(text: str) -> Optional[float]:
    m = re.search(r"over\s*([0-9]+)\s*k\s*sf|over\s*([0-9]+)\s*sf|min\s*([0-9]+)\s*sf", text.lower())
    if not m:
        return None
    if m.group(1):
        return float(m.group(1)) * 1000
    return float(m.group(2) or m.group(3))

def _find_max_price(text: str) -> Optional[float]:
    m = re.search(r"under\s*\$?\s*([0-9]+(?:\.[0-9]+)?)\s*([mk])?", text.lower())
    if not m:
        return None
    val = float(m.group(1))
    mult = m.group(2)
    if mult == "m":
        val *= 1_000_000
    if mult == "k":
        val *= 1_000
    return val

def route(text: str) -> Dict[str, Any]:
    """
    Returns:
    - search filters
    - selected property (best match)
    - run request (same as /properties/{pid}/run params)
    """
    asset_class = _find_asset_class(text)
    state = _find_state(text)
    min_sqft = _find_min_sqft(text)
    max_price = _find_max_price(text)

    results = search_properties(
        state=state,
        asset_class=asset_class,
        min_sqft=min_sqft,
        max_sqft=None,
        min_price=None,
        max_price=max_price
    )

    top = results[:3]
    selected = top[0] if top else None

    # Reuse existing deal interpreter for financing params
    deal_req = interpret(text)  # will pull ltc, rate, hold, exit cap, etc. if present

    return {
        "search": {
            "state": state,
            "asset_class": asset_class,
            "min_sqft": min_sqft,
            "max_price": max_price,
            "matches": len(results),
        },
        "top_matches": top,
        "selected": selected,
        "deal_request": deal_req
    }
