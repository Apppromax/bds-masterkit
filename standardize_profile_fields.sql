-- Add missing columns for name card standardization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- Update existing profiles with default values if necessary (optional)
-- UPDATE public.profiles SET job_title = 'Chuyên viên BĐS' WHERE job_title IS NULL;
