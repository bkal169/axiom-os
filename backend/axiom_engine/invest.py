from dataclasses import dataclass
from typing import List, Dict
from .finance import npv, irr, amort_schedule, monthly_payment

def equity_multiple(total_distributions: float, total_equity: float) -> float:
    if total_equity <= 0:
        raise ValueError("total_equity must be > 0")
    return total_distributions / total_equity

@dataclass
class RefiCompareInputs:
    principal: float
    annual_rate_current: float
    annual_rate_new: float
    amort_years: int = 30
    months_remaining: int = 360
    refi_costs: float = 0.0

def refinance_compare(x: RefiCompareInputs) -> Dict[str, float]:
    """
    Simple compare: payment difference + breakeven months on refi_costs.
    """
    pmt_current = monthly_payment(x.principal, x.annual_rate_current, x.amort_years)
    pmt_new = monthly_payment(x.principal, x.annual_rate_new, x.amort_years)
    monthly_savings = pmt_current - pmt_new

    breakeven_months = float("inf")
    if monthly_savings > 0:
        breakeven_months = x.refi_costs / monthly_savings if x.refi_costs > 0 else 0.0

    return {
        "monthly_payment_current": pmt_current,
        "monthly_payment_new": pmt_new,
        "monthly_savings": monthly_savings,
        "refi_costs": x.refi_costs,
        "breakeven_months": breakeven_months,
    }

def npv_from_cashflows(discount_rate: float, cashflows: List[float]) -> float:
    return npv(discount_rate, cashflows)

def irr_from_cashflows(cashflows: List[float]) -> float:
    return irr(cashflows)
