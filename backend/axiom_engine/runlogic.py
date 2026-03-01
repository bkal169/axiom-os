from typing import Dict, Any
from .finance import DealInputs, project_deal
from .formatting import fmt_result, executive_summary
from axiom_engine.persist import save_run

def run_scenarios(deal: DealInputs) -> Dict[str, Any]:
    """
    Returns multiple scenario results from a single DealInputs baseline.
    """
    scenarios = {}

    # Base
    scenarios["base"] = project_deal(deal)

    # Rate shock (+200 bps)
    deal_rate = DealInputs(**{**deal.__dict__, "interest_rate": deal.interest_rate + 0.02})
    scenarios["rate_shock_+200bps"] = project_deal(deal_rate)

    # NOI shock (-15% in year 1)
    deal_noi = DealInputs(**{**deal.__dict__, "noi_year1": deal.noi_year1 * 0.85})
    scenarios["noi_shock_-15pct"] = project_deal(deal_noi)

    # Exit cap shock (+100 bps)
    deal_exit = DealInputs(**{**deal.__dict__, "exit_cap_rate": deal.exit_cap_rate + 0.01})
    scenarios["exit_cap_shock_+100bps"] = project_deal(deal_exit)

    # Recession combo: rate +200 bps, NOI -20%, exit cap +150 bps
    deal_recession = DealInputs(**{
        **deal.__dict__,
        "interest_rate": deal.interest_rate + 0.02,
        "noi_year1": deal.noi_year1 * 0.80,
        "exit_cap_rate": deal.exit_cap_rate + 0.015
    })
    scenarios["recession_combo"] = project_deal(deal_recession)

    return scenarios

def run_deal_package(
    property_row: Dict[str, Any],
    ltc: float,
    interest_rate: float,
    amort_years: int,
    hold_years: int,
    noi_growth: float,
    exit_cap_rate: float,
    sale_cost_pct: float,
    purchase_price_override: float = 0.0,
    noi_year1_override: float = 0.0,
    capex_override: float = 0.0,
    vacancy_override: float = -1.0,
    org_id: str | None = None,
) -> Dict[str, Any]:

    purchase_price = float(property_row.get("ask_price") or 0.0)
    noi_year1 = float(property_row.get("noi_year1") or 0.0)

    if purchase_price_override > 0:
        purchase_price = purchase_price_override
    if noi_year1_override > 0:
        noi_year1 = noi_year1_override
    if vacancy_override >= 0:
        noi_year1 = noi_year1 * (1 - vacancy_override)

    if purchase_price <= 0:
        return {"error": "missing_price", "id": property_row.get("id")}
    if noi_year1 <= 0:
        return {"error": "missing_noi", "id": property_row.get("id"), "hint": "Provide noi_year1_override."}

    loan_amount = purchase_price * ltc
    equity = (purchase_price - loan_amount) + max(0.0, capex_override)

    deal = DealInputs(
        purchase_price=purchase_price,
        equity=equity,
        loan_amount=loan_amount,
        interest_rate=interest_rate,
        amort_years=amort_years,
        hold_years=hold_years,
        noi_year1=noi_year1,
        noi_growth=noi_growth,
        exit_cap_rate=exit_cap_rate,
        sale_cost_pct=sale_cost_pct,
    )

    scen = run_scenarios(deal)
    base_fmt = fmt_result(scen["base"])
    scen_fmt = {k: fmt_result(v) for k, v in scen.items()}

    assumptions = {
        "ltc": ltc,
        "interest_rate": interest_rate,
        "amort_years": amort_years,
        "hold_years": hold_years,
        "noi_growth": noi_growth,
        "exit_cap_rate": exit_cap_rate,
        "sale_cost_pct": sale_cost_pct,
        "purchase_price_override": purchase_price_override,
        "noi_year1_override": noi_year1_override,
        "capex_override": capex_override,
        "vacancy_override": vacancy_override,
    }

    property_out = {
        **property_row,
        "ask_price": purchase_price,
        "noi_year1": noi_year1,
        "equity_total": equity,
        "loan_amount": loan_amount,
    }

    pkg = {
        "summary": executive_summary(property_out, assumptions, base_fmt),
        "property": property_out,
        "assumptions": assumptions,
        "scenarios": scen_fmt,
    }

    saved = save_run({
        "property_id": property_row.get("id"),
        "org_id": org_id,
        "assumptions": pkg["assumptions"],
        "base": pkg["scenarios"]["base"],
        "summary": pkg["summary"],
    })

    return {**pkg, "saved": saved}
