-- 1. Thêm cột credits nếu chưa có
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits BIGINT DEFAULT 0;

-- 2. Tạo bảng lịch sử credit
CREATE TABLE IF NOT EXISTS public.credit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  amount INT,
  type TEXT,
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cấp quyền RLS cho bảng log
ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ nếu có để tránh lỗi trùng lặp
DROP POLICY IF EXISTS "Users can view own credit logs" ON public.credit_logs;
DROP POLICY IF EXISTS "Admins can view all credit logs" ON public.credit_logs;

CREATE POLICY "Users can view own credit logs" ON public.credit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all credit logs" ON public.credit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 4. Cập nhật hàm tạo user mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, tier, credits)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user', 'free', 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Hàm trừ điểm bảo mật (RPC)
CREATE OR REPLACE FUNCTION public.deduct_credits_secure(p_cost INT, p_action TEXT)
RETURNS JSONB AS $$
DECLARE
    v_current_credits BIGINT;
    v_user_role TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Cho phép cập nhật thông qua session variable
    PERFORM set_config('app.allow_credit_update', 'true', true);
    
    SELECT credits, role INTO v_current_credits, v_user_role
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'message', 'Unauthorized'); END IF;
    IF v_user_role = 'admin' THEN RETURN jsonb_build_object('success', true, 'message', 'Admin bypass'); END IF;
    IF v_current_credits < p_cost THEN RETURN jsonb_build_object('success', false, 'message', 'Insufficient credits'); END IF;

    UPDATE public.profiles SET credits = credits - p_cost WHERE id = v_user_id;
    INSERT INTO public.credit_logs (user_id, amount, type, action) VALUES (v_user_id, -p_cost, 'usage', p_action);

    PERFORM set_config('app.allow_credit_update', 'false', true);

    RETURN jsonb_build_object('success', true, 'new_balance', v_current_credits - p_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger bảo vệ cột credits
CREATE OR REPLACE FUNCTION public.protect_credits_column()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.credits IS DISTINCT FROM NEW.credits THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            IF (current_setting('app.allow_credit_update', true) IS DISTINCT FROM 'true') THEN
                RAISE EXCEPTION 'Bạn không có quyền sửa đổi số dư Credits trực tiếp.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protect_credits ON public.profiles;
CREATE TRIGGER trigger_protect_credits
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_credits_column();
