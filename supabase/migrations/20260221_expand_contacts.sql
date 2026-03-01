-- Migration: Add check-size and geo columns to contacts table
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS min_check_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_check_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS preferred_geographies text [] DEFAULT '{}';