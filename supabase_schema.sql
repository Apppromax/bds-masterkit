-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  agency TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  tier TEXT DEFAULT 'free', -- 'free', 'pro_monthly', 'pro_yearly'
  tier_expiry TIMESTAMPTZ,
  credits BIGINT DEFAULT 0,
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

-- 2. Credit Logs (Transaction History for credits)
CREATE TABLE public.credit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  amount INT, -- positive for top-up, negative for usage
  type TEXT, -- 'top-up', 'usage'
  action TEXT, -- e.g., 'Created AI Image', 'Admin Top-up'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit logs"
  ON public.credit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credit logs"
  ON public.credit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Transactions Table
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

-- 4. Saved Clients (Feng Shui History / CRM Mini)
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

-- 5. Content History (Generated Content)
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

-- 6. Sales Scripts (Admin managed, User viewable)
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
  INSERT INTO public.profiles (id, email, full_name, role, tier, credits)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user', 'free', 0);
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


-- 7. API Key Management (Advanced Pool)
CREATE TABLE public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider TEXT NOT NULL, -- 'gemini', 'openai', 'stability'
  key_value TEXT NOT NULL, -- This should be encrypted in a real app
  name TEXT, -- Friendly name e.g. "Gemini Free 1"
  is_active BOOLEAN DEFAULT TRUE,
  usage_count BIGINT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_rate_limited BOOLEAN DEFAULT FALSE,
  rate_limit_reset_at TIMESTAMPTZ,
  tier TEXT DEFAULT 'free', -- 'free', 'pro'
  error_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for API Keys (Strictly Admin Only)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage api keys"
  ON public.api_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 8. API Logs (History)
CREATE TABLE public.api_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  provider TEXT,
  model TEXT,
  endpoint TEXT,
  status_code INT,
  duration_ms INT,
  prompt_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for API Logs
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON public.api_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own logs"
  ON public.api_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 9. Security Functions for Credits (RPC)
-- This function runs on the server with elevated privileges (SECURITY DEFINER)
-- making it impossible for users to bypass credit checks via the client.
CREATE OR REPLACE FUNCTION public.deduct_credits_secure(p_cost INT, p_action TEXT)
RETURNS JSONB AS $$
DECLARE
    v_current_credits BIGINT;
    v_user_role TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Set session variable to bypass trigger
    PERFORM set_config('app.allow_credit_update', 'true', true);
    
    -- 1. Get current status
    SELECT credits, role INTO v_current_credits, v_user_role
    FROM public.profiles
    WHERE id = v_user_id;

    -- 2. Validate user
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- 3. Admins bypass credit deduction
    IF v_user_role = 'admin' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Admin bypass');
    END IF;

    -- 4. Check balance
    IF v_current_credits < p_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    -- 5. Deduct credits
    UPDATE public.profiles
    SET credits = credits - p_cost
    WHERE id = v_user_id;

    -- 6. Log transaction
    INSERT INTO public.credit_logs (user_id, amount, type, action)
    VALUES (v_user_id, -p_cost, 'usage', p_action);

    -- Reset session variable
    PERFORM set_config('app.allow_credit_update', 'false', true);

    RETURN jsonb_build_object('success', true, 'new_balance', v_current_credits - p_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Protection Trigger: Prevent manual credit modification
-- Users can update their name/phone, but NEVER their credits directly.
CREATE OR REPLACE FUNCTION public.protect_credits_column()
RETURNS TRIGGER AS $$
BEGIN
    -- If credits are being changed
    IF OLD.credits IS DISTINCT FROM NEW.credits THEN
        -- Only allow if the action is performed by an admin
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            -- Check if it's the internal system process (postgres) running the RPC
            -- We use the session variable set in the RPC to bypass this.
            IF (current_setting('app.allow_credit_update', true) IS DISTINCT FROM 'true') THEN
                RAISE EXCEPTION 'Bạn không có quyền sửa đổi số dư Credits trực tiếp.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_credits
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_credits_column();
