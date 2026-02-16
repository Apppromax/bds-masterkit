-- 1. Add 'agency' column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency TEXT;

-- 2. Handle phone column migration safely
DO $$
BEGIN
    -- Check if target 'phone' column already exists
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        -- Target column exists. 
        -- If 'phone_number' also exists, we might want to copy data, but let's assume 'phone' is the one being used now.
        -- We can optionally drop phone_number if we are sure, but let's just leave it to be safe or drop it if it's redundant.
        -- For now, do nothing as 'phone' is present.
        RAISE NOTICE 'Column phone already exists. Skipping rename.';
    ELSE
        -- Target 'phone' does NOT exist. Check if source 'phone_number' exists.
        IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
            ALTER TABLE public.profiles RENAME COLUMN phone_number TO phone;
            RAISE NOTICE 'Renamed phone_number to phone.';
        ELSE
            -- Neither exists. Create 'phone' column.
            ALTER TABLE public.profiles ADD COLUMN phone TEXT;
            RAISE NOTICE 'Created new column phone.';
        END IF;
    END IF;
END $$;
