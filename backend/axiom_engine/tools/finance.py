from supabase import Client
from axiom_engine.finance import DealInputs, project_deal
from axiom_engine.formatting import money, pct

def generate_fiscal_plan_text(deal_data: dict) -> str:
    """
    Generates a detailed fiscal plan summary from deal metrics.
    If metrics are missing, it uses institutional defaults.
    """
    # Extract inputs with defaults
    # purchase_price is acquisition_price in DB
    price = float(deal_data.get("acquisition_price") or 5000000)
    
    # We might need to estimate NOI if missing (e.g. 6% cap rate)
    noi_y1 = float(deal_data.get("noi_year1") or (price * 0.055))
    
    # Debt assumptions (can be pulled from deal_data later)
    ltc = float(deal_data.get("ltc") or 0.65)
    rate = float(deal_data.get("interest_rate") or 0.075)
    amort = int(deal_data.get("amort_years") or 30)
    hold = int(deal_data.get("hold_years") or 5)
    
    loan = price * ltc
    equity = price - loan
    
    inputs = DealInputs(
        purchase_price=price,
        equity=equity,
        loan_amount=loan,
        interest_rate=rate,
        amort_years=amort,
        hold_years=hold,
        noi_year1=noi_y1,
        noi_growth=0.03,
        exit_cap_rate=0.0625,
        sale_cost_pct=0.03
    )
    
    results = project_deal(inputs)
    
    # Format the Plan
    plan = []
    plan.append("## AXIOM Fiscal Plan (Projected)")
    plan.append(f"### Basis & Capital Structure")
    plan.append(f"- **Purchase Price:** {money(price)}")
    plan.append(f"- **Loan Amount ({ltc:.0%}):** {money(loan)}")
    plan.append(f"- **Equity Contribution:** {money(equity)}")
    plan.append(f"- **Financing:** {rate:.2%} Interest | {amort}yr Amortization")
    
    plan.append(f"\n### Operating Projections (Year 1)")
    plan.append(f"- **NOI (Year 1):** {money(noi_y1)}")
    plan.append(f"- **Debt Service (Annual):** {money(results['debt_service_annual'])}")
    plan.append(f"- **DSCR:** {results['dscr_year1']:.2f}")
    plan.append(f"- **Cash-on-Cash:** {results['cash_on_cash_year1']*100:.2f}%")
    
    plan.append(f"\n### Exit & Returns (Year {hold})")
    plan.append(f"- **Exit Cap Rate:** 6.25%")
    plan.append(f"- **Est. Sale Price:** {money(results['sale_price_est'])}")
    plan.append(f"- **Net Profit to Equity:** {money(results['net_sale_to_equity_est'])}")
    plan.append(f"- **Target IRR:** {results['irr']*100:.2f}%")
    plan.append(f"- **Equity Multiple:** {results['equity_multiple']:.2f}x")
    
    return "\n".join(plan)
