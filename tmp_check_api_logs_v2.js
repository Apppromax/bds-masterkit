import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
    const { data: { session } } = await supabase.auth.signInWithPassword({
        email: process.env.TEST_EMAIL || 'admin@example.com',
        password: process.env.TEST_PASSWORD || 'password'
    });

    // I will try to use a simple query that might fail if column doesn't exist
    const { data, error } = await supabase.from('api_logs').select('total_tokens').limit(1);
    if (error && error.message.includes('total_tokens')) {
        console.log('Column total_tokens does NOT exist.');
    } else if (!error) {
        console.log('Column total_tokens EXACTLY exists.');
    } else {
        console.log('Error checking tokens:', error.message);
    }
}

checkColumns();
