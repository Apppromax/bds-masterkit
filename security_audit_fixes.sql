-- Security Audit Fixes (OWASP 2025 Standards)

-- 1. Tighten Profiles RLS: Avoid PII Leakage
-- Old policy "Public profiles are viewable by everyone" was too permissive.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow users to see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to see all profiles for management
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. Ensure robust profile update for self-only (unless admin)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. Cleanup unused columns if existing (Safety check)
-- No destructive drops for now to ensure uptime.
