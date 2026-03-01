import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from axiom.backend.axiom_engine.finance import project_deal, DealInputs

def main():
    deal = DealInputs(
        purchase_price=1_000_000,
        equity=300_000,
        loan_amount=700_000,
        interest_rate=0.05,
        amort_years=30,
        hold_years=5,
        noi_year1=60_000,
        noi_growth=0.02,
        exit_cap_rate=0.06,
        sale_cost_pct=0.03
    )

    results = project_deal(deal)
    print("Project Deal Results:")
    for key, value in results.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    main()
