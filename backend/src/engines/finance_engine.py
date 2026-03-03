"""
backend/src/engines/finance_engine.py
Phase 4 Finance Engine — risk-adjusted pro forma and debt sizing.
Called by the FastAPI backend; outputs feed into decision_artifacts.
"""

from typing import Dict, Optional


class FinanceEngine:
    """
    Skeleton finance engine — generates risk-adjusted pro forma,
    debt capacity, and return metrics for a development project.

    TODO:
      - Fetch project state from Supabase (projects.state)
      - Wire real loan term sheets (LTC, rate, IO period) from project inputs
      - Calculate monthly cash flows for proper IRR (not stub 18%)
      - Integrate DSCR-based lender underwriting logic
    """

    def __init__(self, db=None, risk_engine=None):
        self.db = db
        self.risk_engine = risk_engine

    async def generate_underwriting_package(self, project_id: str) -> Dict:
        """
        Produces a full underwriting package for a project.
        Persisted via the decision-artifacts Edge Function.
        """
        # TODO: replace with real project state fetch
        project = {
            "purchase_price":       5_000_000,
            "renovation_budget":    3_000_000,
            "hold_period_months":   24,
            "exit_cap_rate":        0.06,
            "loan_ltc":             0.70,
            "loan_rate":            0.065,
        }

        # Get risk adjustments from RiskEngine
        risk: Dict = {}
        if self.risk_engine:
            risk = await self.risk_engine.assess_project_risk(project_id)

        adjusted = self._apply_risk_adjustments(project, risk)
        base_case = self._generate_pro_forma(project, adjusted)
        debt = self._size_debt(project, base_case)
        returns = self._calculate_returns(base_case, debt)

        return {
            "base_case":         base_case,
            "debt_analysis":     debt,
            "returns":           returns,
            "risk_adjusted_irr": returns.get("irr"),
        }

    # ─────────────────────────────────────────────────────────

    def _apply_risk_adjustments(self, project: Dict, risk: Dict) -> Dict:
        cost_mult = 1.0 + (risk.get("total_cost_impact_pct", 0.0) / 100.0)
        timeline_add = risk.get("total_time_impact_days", 0) / 30.0
        return {
            "adjusted_construction_cost": project["renovation_budget"] * cost_mult,
            "adjusted_timeline_months":   project["hold_period_months"] + timeline_add,
        }

    def _generate_pro_forma(self, project: Dict, adjusted: Dict) -> Dict:
        purchase = project["purchase_price"]
        constr = adjusted["adjusted_construction_cost"]
        basis = purchase + constr
        noi = basis * 0.065             # stabilised NOI ~6.5% on cost
        exit_val = noi / project["exit_cap_rate"]
        loan_amt = basis * project["loan_ltc"]
        return {
            "total_basis":      basis,
            "stabilized_noi":   noi,
            "exit_value":       exit_val,
            "gross_profit":     exit_val - basis,
            "equity_required":  basis - loan_amt,
        }

    def _size_debt(self, project: Dict, base: Dict) -> Dict:
        max_ltv = 0.75
        min_dscr = 1.25
        noi = base["stabilized_noi"]
        ev = base["exit_value"]
        rate = project["loan_rate"]

        ltv_loan = ev * max_ltv
        dscr_loan = (noi / min_dscr) / rate if rate > 0 else ltv_loan
        max_loan = min(ltv_loan, dscr_loan)

        return {
            "max_loan_amount": max_loan,
            "ltv_at_max":      max_loan / ev if ev else None,
            "dscr_at_max":     (noi / max_loan * rate) if max_loan and rate else None,
        }

    def _calculate_returns(self, base: Dict, debt: Dict) -> Dict:
        eq = base["equity_required"]
        profit = base["gross_profit"]

        if not eq or eq <= 0:
            return {"equity_multiple": None, "irr": None, "cash_on_cash": None}

        return {
            "equity_multiple": round(profit / eq, 2),
            "irr":             18.0,   # TODO: replace with proper monthly cash-flow IRR
            "cash_on_cash":    10.0,   # TODO: replace with real operating CoC
        }
