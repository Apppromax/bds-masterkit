import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('api_logs').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    console.log('Columns in api_logs:', Object.keys(data[0] || {}));
}

checkSchema();
