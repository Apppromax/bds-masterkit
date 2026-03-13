import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Usually in .env.local

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
    const { data: users, error: err } = await supabase.from('profiles').select('id, full_name, email, credits, role').limit(5);
    console.log("Profiles:", users, err);
}

run();
