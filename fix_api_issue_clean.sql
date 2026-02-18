
-- 1. Create the RPC function to get the best API key securely
CREATE OR REPLACE FUNCTION get_best_api_key(p_provider text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_id uuid;
BEGIN
  -- Select the best key: proper provider, active, not rate limited
  -- Order by last_used_at to rotate keys (Load Balancing)
  SELECT id, key_value INTO v_id, v_key
  FROM api_keys
  WHERE provider = p_provider
    AND is_active = true
    AND (is_rate_limited = false OR rate_limit_reset_at < NOW())
  ORDER BY last_used_at ASC NULLS FIRST
  LIMIT 1;

  -- Update usage stats if a key was found
  IF v_id IS NOT NULL THEN
    UPDATE api_keys
    SET last_used_at = NOW(),
        usage_count = COALESCE(usage_count, 0) + 1
    WHERE id = v_id;
  END IF;

  RETURN v_key;
END;
$$;

-- 2. Ensure the api_keys table exists (idempotent check)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider TEXT NOT NULL,
  key_value TEXT NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count BIGINT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_rate_limited BOOLEAN DEFAULT FALSE,
  rate_limit_reset_at TIMESTAMPTZ,
  tier TEXT DEFAULT 'free',
  error_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ensure RLS is enabled
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 4. Policy for Admins (in case it was missing)
DROP POLICY IF EXISTS "Admins can manage api keys" ON public.api_keys;
CREATE POLICY "Admins can manage api keys"
  ON public.api_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );