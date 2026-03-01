-- Migration: Add image_urls to deals table
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS image_urls text [] DEFAULT '{}';