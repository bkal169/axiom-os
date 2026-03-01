from typing import Dict, Any

def pct(x: float) -> str:
    return f"{x*100:.2f}%"

def money(x: float) -> str:
    return f"${x:,.0f}"

def fmt_result(r: Dict[str, float]) -> Dict[str, Any]:
    return {
        "cap_rate_year1": pct(r["cap_rate_year1"]),
        "dscr_year1": round(r["dscr_year1"], 2),
        "cash_on_cash_year1": pct(r["cash_on_cash_year1"]),
        "irr": pct(r["irr"]),
        "equity_multiple": round(r["equity_multiple"], 2),
        "sale_price_est": money(r["sale_price_est"]),
        "net_sale_to_equity_est": money(r["net_sale_to_equity_est"]),
        "debt_service_annual": money(r["debt_service_annual"]),
        "ending_loan_balance_est": money(r["ending_loan_balance_est"]),
    }

def executive_summary(property_row: Dict[str, Any], assumptions: Dict[str, Any], base_fmt: Dict[str, Any]) -> str:
    # Safely get values with defaults to avoid KeyErrors if keys are missing
    asset_class = property_row.get('asset_class', 'Unknown')
    sqft = property_row.get('sqft', 0)
    city = property_row.get('city', 'Unknown')
    state = property_row.get('state', 'Unknown')
    ask_price = property_row.get('ask_price', 0)
    noi_year1 = property_row.get('noi_year1', 0)
    
    ltc = assumptions.get('ltc', 0)
    interest_rate = assumptions.get('interest_rate', 0)
    hold_years = assumptions.get('hold_years', 0)
    exit_cap = assumptions.get('exit_cap_rate', 0)

    # Format values for display
    ask_price_fmt = money(float(ask_price)) if ask_price else "$0"
    noi_fmt = money(float(noi_year1)) if noi_year1 else "$0"

    return (
        f"AXIOM DEAL SNAPSHOT\n"
        f"- Asset: {asset_class} | {sqft} SF | {city}, {state}\n"
        f"- Ask: {ask_price_fmt} | NOI Y1: {noi_fmt}\n"
        f"- Assumptions: LTC {ltc:.0%}, Rate {interest_rate:.2%}, Hold {hold_years}y, Exit Cap {exit_cap:.2%}\n"
        f"- Base: IRR {base_fmt.get('irr', 'N/A')} | CoC {base_fmt.get('cash_on_cash_year1', 'N/A')} | DSCR {base_fmt.get('dscr_year1', 'N/A')} | EM {base_fmt.get('equity_multiple', 'N/A')}"
    )
