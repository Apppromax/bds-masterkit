
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKeys() {
    console.log('Checking API Keys in Database...');

    // Chúng ta gọi RPC get_best_api_key giống như app để xem nó trả về gì
    const providers = ['gemini', 'openai', 'stability'];

    for (const p of providers) {
        const { data, error } = await supabase.rpc('get_best_api_key', { p_provider: p });

        if (error) {
            console.error(`Error checking ${p}:`, error.message);
        } else if (data) {
            console.log(`✅ Found active key for [${p}]: ${data.substring(0, 8)}...`);
        } else {
            console.log(`❌ No active key found for [${p}]`);
        }
    }

    // List all keys (admin view simulation)
    // Note: RLS might block this if not admin, but RPC above helps confirm usage logic
}

checkKeys();
