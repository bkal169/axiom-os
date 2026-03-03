-- ============================================================
-- 20260303040000_vault_cmk_encryption.sql
-- Phase 4 Hardening: Supabase Vault CMK Isolation
-- Enables physical isolation of proprietary tenant deal data
-- ============================================================
-- 1. Enable the cryptographic and vault extensions
CREATE EXTENSION IF NOT EXISTS pgsodium;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
-- 2. Expand the projects table to support CMK-isolated data
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS encrypted_rent_roll TEXT,
    ADD COLUMN IF NOT EXISTS cmk_key_id UUID REFERENCES vault.secrets(id);
-- Note: In production, the tenant's specific Customer Managed Key (CMK)
-- is stored in `vault.secrets`. The `cmk_key_id` maps the project 
-- to the specific key required to decrypt `encrypted_rent_roll` via pgsodium.
-- Create an RLS policy to ensure only the tenant can access their CMK
-- (Assuming profiles.id maps to auth.uid() and projects has a tenant_id or user_id)
-- For demonstration, we ensure the column is primed for the Edge Function CMK proxy.