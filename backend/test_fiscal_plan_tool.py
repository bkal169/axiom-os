import os
import sys
from dotenv import load_dotenv
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from axiom_engine.tools.finance import generate_fiscal_plan_text

def test_fiscal_plan():
    print("--- Testing Fiscal Plan Generation ---")
    mock_deal = {
        "acquisition_price": 6250000,
        "noi_year1": 412500,
        "ltc": 0.70,
        "interest_rate": 0.065,
        "amort_years": 25,
        "hold_years": 7
    }
    
    plan = generate_fiscal_plan_text(mock_deal)
    print(plan)
    
    # Assertions
    assert "**Purchase Price:** $6,250,000" in plan
    assert "7-year Amortization" not in plan # Should be '25yr Amortization'
    assert "25yr Amortization" in plan
    assert "Target IRR" in plan
    
    print("\nSUCCESS: Fiscal Plan generated correctly.")

if __name__ == "__main__":
    test_fiscal_plan()
