const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to Supabase...');
        await client.connect();

        console.log('Creating RPC function get_best_api_key...');

        await client.query(`
            CREATE OR REPLACE FUNCTION get_best_api_key(p_provider TEXT)
            RETURNS TEXT
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            DECLARE
              v_key TEXT;
              v_id UUID;
            BEGIN
              -- Select the best candidate
              SELECT id, key_value INTO v_id, v_key
              FROM public.api_keys
              WHERE is_active = TRUE 
                AND provider = p_provider
              ORDER BY 
                CASE WHEN tier = 'pro' THEN 0 ELSE 1 END, -- Prioritize PRO keys
                last_used_at ASC NULLS FIRST -- Load balancing: use least recently used
              LIMIT 1
              FOR UPDATE SKIP LOCKED; -- Prevent race conditions

              -- If found, update stats and return
              IF v_id IS NOT NULL THEN
                UPDATE public.api_keys
                SET 
                  last_used_at = NOW(),
                  usage_count = usage_count + 1
                WHERE id = v_id;
                
                RETURN v_key;
              END IF;

              RETURN NULL;
            END;
            $$;
        `);

        console.log('✅ RPC Function created successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        console.log('Done.');
    }
}

run();
