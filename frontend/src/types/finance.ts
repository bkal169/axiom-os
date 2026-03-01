export interface ProjectionResults {
    irr_unlevered: number;
    irr_levered: number;
    coc_year1: number;
    dscr_year1: number;
    total_profit: number;
    hold_period_years: number;
    exit_value: number;
}

export interface FinanceInputs {
    purchase_price: number;
    loan_amount: number;
    equity: number;
    interest_rate: number;
    amort_years: number;
    hold_years: number;
    noi_year1: number;
    noi_growth: number;
    exit_cap_rate: number;
    sale_cost_pct: number;
}
