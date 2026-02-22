-- Add business_email column for name card standardization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_email TEXT;
