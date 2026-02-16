-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  tier TEXT DEFAULT 'free', -- 'free', 'pro_monthly', 'pro_yearly'
  tier_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Transactions Table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  amount BIGINT,
  plan_type TEXT, -- 'pro_monthly', 'pro_yearly'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  proof_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view and update all transactions"
  ON public.transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Saved Clients (Feng Shui History / CRM Mini)
CREATE TABLE public.saved_clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  client_name TEXT,
  birth_year INT,
  gender TEXT, -- 'male', 'female'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Saved Clients
ALTER TABLE public.saved_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own clients"
  ON public.saved_clients FOR ALL
  USING (auth.uid() = user_id);

-- 4. Content History (Generated Content)
CREATE TABLE public.content_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  content TEXT,
  category TEXT, -- 'facebook', 'zalo', etc.
  tone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Content History
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own content history"
  ON public.content_history FOR ALL
  USING (auth.uid() = user_id);

-- 5. Sales Scripts (Admin managed, User viewable)
CREATE TABLE public.sales_scripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  situation TEXT,
  content TEXT,
  category TEXT, -- 'objection', 'closing', etc.
  tags TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Sales Scripts
ALTER TABLE public.sales_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view sales scripts"
  ON public.sales_scripts FOR SELECT
  USING (true);

CREATE POLICY "Only Admins can insert/update/delete scripts"
  ON public.sales_scripts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to handle new user signup (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, tier)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user', 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Data (Optional - Admin User)
-- Note: You have to sign up manually first to create a user in auth.users,

-- 6. App Settings (API Keys, Global Config)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for App Settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app settings"
  ON public.app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy for Admins to update ANY profile (e.g. upgrade tiers)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

