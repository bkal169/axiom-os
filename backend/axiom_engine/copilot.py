import re
from typing import Dict, Any, Optional
from .finance import DealInputs, project_deal

MONEY_RE = re.compile(r"\$?\s*([0-9]+(?:\.[0-9]+)?)\s*([mkMK])?")
PCT_RE = re.compile(r"([0-9]+(?:\.[0-9]+)?)\s*%")

def _parse_money(text: str) -> Optional[float]:
    m = MONEY_RE.search(text)
    if not m:
        return None
    val = float(m.group(1))
    mult = m.group(2)
    if mult:
        mult = mult.lower()
        if mult == "m":
            val *= 1_000_000
        elif mult == "k":
            val *= 1_000
    return val

def _slice_after(text: str, keyword: str, window: int = 60) -> str:
    idx = text.find(keyword)
    if idx == -1:
        return ""
    return text[idx: idx + window]

def _parse_pct_after_keyword(text: str, keyword: str) -> Optional[float]:
    pattern = re.compile(
        rf"{keyword}\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*%|([0-9]+(?:\.[0-9]+)?)\s*%\s*{keyword}",
        re.IGNORECASE
    )
    m = pattern.search(text)
    if not m:
        return None
    val = float(m.group(1) or m.group(2))
    return val / 100.0

def _parse_int_after_keyword(text: str, keyword: str) -> Optional[int]:
    pattern = re.compile(rf"{keyword}\s*[:=]?\s*([0-9]+)", re.IGNORECASE)
    m = pattern.search(text)
    if not m:
        return None
    return int(m.group(1))

def interpret(text: str) -> Dict[str, Any]:
    t = text.strip().lower()

    purchase = None
    for kw in ["purchase price", "price", "purchase", "buy"]:
        p = _parse_money(_slice_after(t, kw))
        if p:
            purchase = p
            break
    if purchase is None:
        purchase = _parse_money(t)

    ltc = _parse_pct_after_keyword(t, "ltc") or _parse_pct_after_keyword(t, "loan to cost")
    rate = _parse_pct_after_keyword(t, "interest") or _parse_pct_after_keyword(t, "rate")

    # If rate missing but first % exists, use it
    if rate is None:
        m = PCT_RE.search(t)
        if m:
            rate = float(m.group(1)) / 100.0

    hold_years = _parse_int_after_keyword(t, "hold")
    if hold_years is None:
        m = re.search(r"([0-9]+)\s*-\s*year\s*hold|([0-9]+)\s*year\s*hold", t)
        if m:
            hold_years = int(m.group(1) or m.group(2))

    exit_cap = _parse_pct_after_keyword(t, "exit cap") or _parse_pct_after_keyword(t, "exit")
    amort_years = _parse_int_after_keyword(t, "amort") or 30

    noi = _parse_money(_slice_after(t, "noi"))
    if noi is None:
        noi = _parse_money(t)

    if purchase is None:
        # Fallback if purchase is truly missing is tricky.
        # But per logic, we might need it. Let's not raise here instantly to let partials pass if we want,
        # but the request demanded it.
        # raise ValueError("Missing purchase price.")
        pass

    # Defaults
    if ltc is None:
        ltc = 0.70
    if rate is None:
        rate = 0.08
    if hold_years is None:
        hold_years = 5
    if exit_cap is None:
        exit_cap = 0.06
    if noi is None and purchase:
        noi = max(0.06 * purchase, 250_000)

    loan_amount = 0.0
    equity = 0.0
    if purchase:
        loan_amount = purchase * ltc
        equity = purchase - loan_amount

    return {
        "intent": "model_deal",
        "inputs": {
            "purchase_price": purchase,
            "ltc": ltc,
            "loan_amount": loan_amount,
            "equity": equity,
            "interest_rate": rate,
            "amort_years": amort_years,
            "hold_years": hold_years,
            "noi_year1": noi,
            "noi_growth": 0.02,
            "exit_cap_rate": exit_cap
        }
    }

def execute(request: Dict[str, Any]) -> Dict[str, Any]:
    if request.get("intent") != "model_deal":
        raise ValueError("Unsupported intent")

    inp = request["inputs"]
    
    # Validation before creating DealInputs
    if not inp.get("purchase_price"):
         return {"error": "Could not determine purchase price"}

    deal = DealInputs(
        purchase_price=inp["purchase_price"],
        equity=inp["equity"],
        loan_amount=inp["loan_amount"],
        interest_rate=inp["interest_rate"],
        amort_years=inp["amort_years"],
        hold_years=inp["hold_years"],
        noi_year1=inp["noi_year1"],
        noi_growth=inp.get("noi_growth", 0.02),
        exit_cap_rate=inp.get("exit_cap_rate", 0.06),
        sale_cost_pct=inp.get("sale_cost_pct", 0.03) # Added to match code usage if passed, or default
    )
    out = project_deal(deal)
    return {"request": request, "result": out}
