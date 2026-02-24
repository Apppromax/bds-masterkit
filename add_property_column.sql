-- Add interested_property column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_property TEXT;
