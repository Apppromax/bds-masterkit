-- Fix RLS Policies for AI Features

-- 1. App Settings: Allow all authenticated users to read settings
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
CREATE POLICY "Anyone can view app settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- 2. API Logs: Allow users to insert their own logs
DROP POLICY IF EXISTS "Users can insert own logs" ON public.api_logs;
CREATE POLICY "Users can insert own logs"
  ON public.api_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Credit Logs: Ensure users can insert usage logs (mostly for traceability)
DROP POLICY IF EXISTS "Users can insert own credit logs" ON public.credit_logs;
CREATE POLICY "Users can insert own credit logs"
  ON public.credit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Re-Verify Function Permissions
GRANT EXECUTE ON FUNCTION public.get_best_api_key(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits_secure(int, text) TO authenticated;

-- 5. Fix potential recursion in profiles update (Admins updating others)
-- The existing policy "Admins can update all profiles" is good.
