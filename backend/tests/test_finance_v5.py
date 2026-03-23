"""Tests for finance.py — IRR, NPV, cap rate calculations."""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from axiom_engine.finance import calculate_irr, calculate_npv, calculate_cap_rate


def test_irr_basic():
    cash_flows = [-1_000_000, 120_000, 125_000, 130_000, 135_000, 1_350_000]
    irr = calculate_irr(cash_flows)
    assert 0.15 < irr < 0.30, f"Expected IRR ~20%, got {irr:.2%}"


def test_npv_positive_at_8_pct():
    cash_flows = [-500_000, 55_000, 57_000, 59_000, 61_000, 620_000]
    npv = calculate_npv(cash_flows, discount_rate=0.08)
    assert npv > 0, f"Expected positive NPV at 8%, got {npv:,.0f}"


def test_npv_negative_at_high_rate():
    cash_flows = [-500_000, 55_000, 57_000, 59_000, 61_000, 620_000]
    npv = calculate_npv(cash_flows, discount_rate=0.35)
    assert npv < 0, f"Expected negative NPV at 35%, got {npv:,.0f}"


def test_cap_rate_standard():
    cap = calculate_cap_rate(noi=120_000, value=1_500_000)
    assert abs(cap - 0.08) < 0.001, f"Expected 8.0% cap rate, got {cap:.2%}"


def test_cap_rate_zero_value_raises():
    with pytest.raises((ValueError, ZeroDivisionError)):
        calculate_cap_rate(noi=100_000, value=0)


def test_irr_all_positive_raises():
    with pytest.raises(Exception):
        calculate_irr([100_000, 200_000, 300_000])
