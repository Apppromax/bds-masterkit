-- Security Fix: Resolve Circular RLS Dependency in profiles table

-- 1. Disable RLS temporarily to avoid conflicts
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 3. Create a clean, non-circular policy for SELECT
-- A user can always see their own profile (simple UID check, no recursion)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- For Admin view, we use a subquery that doesn't trigger recursion 
-- or we rely on the fact that Admins can also see their own profile.
-- To let Admins see EVERYONE, we check their role by selecting from profiles 
-- BUT we must be careful. Supabase allows this if the subquery is limited.
-- However, a better way is to use a SECURITY DEFINER function to check admin status.

CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());

-- 4. Policies for UPDATE
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (is_admin());

-- 5. Policies for INSERT
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Ensure the target user is definitely correct
UPDATE public.profiles 
SET role = 'admin', tier = 'pro', full_name = 'Trần Hữu Chiến' 
WHERE email = 'chientran64@gmail.com';
