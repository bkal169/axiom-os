-- Migration: Add lender-specific columns to contacts
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS max_ltv numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS min_loan_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_loan_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS debt_types text [] DEFAULT '{}';
COMMENT ON COLUMN public.contacts.max_ltv IS 'Maximum Loan-to-Value ratio (e.g. 0.75 for 75%)';
COMMENT ON COLUMN public.contacts.min_loan_size IS 'Minimum loan amount in USD';
COMMENT ON COLUMN public.contacts.max_loan_size IS 'Maximum loan amount in USD';
COMMENT ON COLUMN public.contacts.debt_types IS 'Array of supported debt types (e.g. Senior, Mezzanine, Bridge, Construction)';