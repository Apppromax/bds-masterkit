import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fix() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const query = `
CREATE OR REPLACE FUNCTION public.deduct_credits_secure(p_cost bigint, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_current_credits BIGINT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- VALIDATION: Cost must be positive to prevent accidental or malicious credit injection
    IF p_cost < 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Cost must be non-negative');
    END IF;

    -- Set session variable to bypass trigger (transactional local)
    PERFORM set_config('app.allow_credit_update', 'true', true);
    
    -- 1. Get current status
    SELECT credits INTO v_current_credits
    FROM public.profiles
    WHERE id = v_user_id;

    -- 2. Validate user existence
    IF v_user_id IS NULL OR v_current_credits IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'User profile not found or unauthorized');
    END IF;

    -- 3. Check balance
    IF v_current_credits < p_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không đủ Xu. Vui lòng nạp thêm.');
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
$function$;
    `;

    try {
        await client.query(query);
        console.log("Updated function successfully.");
    } catch (err) {
        console.error("Error updating function:", err);
    }
    await client.end();
}
fix();
