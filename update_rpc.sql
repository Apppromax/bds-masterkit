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

    -- 3. Check balance (Admin is NOT bypassed for testing purposes)
    IF v_current_credits < p_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    -- 4. Deduct credits
    UPDATE public.profiles
    SET credits = credits - p_cost
    WHERE id = v_user_id;

    -- 5. Log transaction
    INSERT INTO public.credit_logs (user_id, amount, type, action)
    VALUES (v_user_id, -p_cost, 'usage', p_action);

    -- Reset session variable
    PERFORM set_config('app.allow_credit_update', 'false', true);

    RETURN jsonb_build_object('success', true, 'new_balance', v_current_credits - p_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
