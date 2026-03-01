from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict, Optional

def npv(rate: float, cashflows: List[float]) -> float:
    return sum(cf / ((1 + rate) ** t) for t, cf in enumerate(cashflows))

def irr(cashflows: List[float], guess: float = 0.12, max_iter: int = 200, tol: float = 1e-7) -> float:
    if not cashflows or all(cf >= 0 for cf in cashflows) or all(cf <= 0 for cf in cashflows):
        raise ValueError("IRR requires at least one positive and one negative cashflow.")

    def d_npv(rate: float) -> float:
        return sum(-t * cf / ((1 + rate) ** (t + 1)) for t, cf in enumerate(cashflows) if t > 0)

    r = guess
    for _ in range(max_iter):
        f = npv(r, cashflows)
        if abs(f) < tol:
            return r
        df = d_npv(r)
        if abs(df) < 1e-12:
            break
        r_next = r - f / df
        if r_next <= -0.9999 or r_next > 10:
            break
        r = r_next

    low, high = -0.9, 5.0
    f_low, f_high = npv(low, cashflows), npv(high, cashflows)
    if f_low * f_high > 0:
        candidates = []
        for r_try in [i / 100 for i in range(-50, 501, 5)]:
            candidates.append((abs(npv(r_try, cashflows)), r_try))
        candidates.sort()
        return candidates[0][1]

    for _ in range(max_iter * 5):
        mid = (low + high) / 2
        f_mid = npv(mid, cashflows)
        if abs(f_mid) < tol:
            return mid
        if f_low * f_mid < 0:
            high, f_high = mid, f_mid
        else:
            low, f_low = mid, f_mid
    return (low + high) / 2

def cap_rate(noi_annual: float, purchase_price: float) -> float:
    if purchase_price <= 0:
        raise ValueError("purchase_price must be > 0")
    return noi_annual / purchase_price

def dscr(noi_annual: float, debt_service_annual: float) -> float:
    if debt_service_annual <= 0:
        raise ValueError("debt_service_annual must be > 0")
    return noi_annual / debt_service_annual

def cash_on_cash(annual_pre_tax_cashflow: float, total_cash_invested: float) -> float:
    if total_cash_invested <= 0:
        raise ValueError("total_cash_invested must be > 0")
    return annual_pre_tax_cashflow / total_cash_invested

def equity_multiple(total_distributions: float, total_equity: float) -> float:
    if total_equity <= 0:
        raise ValueError("total_equity must be > 0")
    return total_distributions / total_equity

@dataclass
class AmortRow:
    period: int
    payment: float
    interest: float
    principal: float
    balance: float

def monthly_payment(principal: float, annual_rate: float, amort_years: int) -> float:
    if principal <= 0:
        raise ValueError("principal must be > 0")
    n = amort_years * 12
    r = annual_rate / 12
    if abs(r) < 1e-12:
        return principal / n
    return principal * (r * (1 + r) ** n) / ((1 + r) ** n - 1)

def amort_schedule(principal: float, annual_rate: float, amort_years: int, months: Optional[int] = None) -> List[AmortRow]:
    n = amort_years * 12 if months is None else months
    pmt = monthly_payment(principal, annual_rate, amort_years)
    bal = principal
    out: List[AmortRow] = []
    r = annual_rate / 12
    for m in range(1, n + 1):
        interest = bal * r
        principal_paid = pmt - interest
        bal = max(0.0, bal - principal_paid)
        out.append(AmortRow(m, pmt, interest, principal_paid, bal))
        if bal <= 0:
            break
    return out

def annual_debt_service(principal: float, annual_rate: float, amort_years: int) -> float:
    return monthly_payment(principal, annual_rate, amort_years) * 12

def insurance_estimate_annual(
    replacement_cost: float,
    asset_class: str,
    location_risk: float = 1.0,
    liability_limit_m: float = 1.0
) -> float:
    if replacement_cost <= 0:
        raise ValueError("replacement_cost must be > 0")

    base_rates = {
        "multifamily": 0.0045,
        "retail": 0.0055,
        "industrial": 0.0035,
        "office": 0.0040,
        "land": 0.0010,
        "mixed_use": 0.0050,
        "other": 0.0050,
    }
    rate = base_rates.get(asset_class.lower(), base_rates["other"])
    liability_factor = 1.0 + max(0.0, (liability_limit_m - 1.0)) * 0.08
    return replacement_cost * rate * max(0.3, location_risk) * liability_factor

@dataclass
class DealInputs:
    purchase_price: float
    equity: float
    loan_amount: float
    interest_rate: float
    amort_years: int
    hold_years: int
    noi_year1: float
    noi_growth: float = 0.02
    exit_cap_rate: float = 0.06
    sale_cost_pct: float = 0.03

def project_deal(deal: DealInputs) -> Dict[str, float]:
    debt_service = annual_debt_service(deal.loan_amount, deal.interest_rate, deal.amort_years)
    nois = [deal.noi_year1 * ((1 + deal.noi_growth) ** y) for y in range(deal.hold_years)]
    annual_cf = [noi - debt_service for noi in nois]

    noi_exit = nois[-1]
    sale_price = noi_exit / deal.exit_cap_rate
    sale_cost = sale_price * deal.sale_cost_pct

    sched = amort_schedule(deal.loan_amount, deal.interest_rate, deal.amort_years, months=deal.hold_years * 12)
    bal_end = sched[-1].balance if sched else deal.loan_amount

    net_sale_to_equity = sale_price - sale_cost - bal_end
    cashflows = [-deal.equity] + annual_cf[:-1] + [annual_cf[-1] + net_sale_to_equity]

    irr_val = irr(cashflows)
    coc = cash_on_cash(annual_cf[0], deal.equity)
    em = equity_multiple(sum(annual_cf) + net_sale_to_equity, deal.equity)
    cap = cap_rate(deal.noi_year1, deal.purchase_price)
    ds = dscr(deal.noi_year1, debt_service)

    return {
        "cap_rate_year1": cap,
        "dscr_year1": ds,
        "cash_on_cash_year1": coc,
        "irr": irr_val,
        "equity_multiple": em,
        "sale_price_est": sale_price,
        "net_sale_to_equity_est": net_sale_to_equity,
        "debt_service_annual": debt_service,
        "ending_loan_balance_est": bal_end,
    }

def construction_cost_estimate(sqft: float, cost_per_sf: float, contingency_pct: float = 0.10) -> float:
    if sqft <= 0 or cost_per_sf <= 0:
        return 0.0
    return sqft * cost_per_sf * (1 + contingency_pct)
