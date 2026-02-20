const { Client } = require('pg');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to Supabase to fix RLS...');
        await client.connect();

        const sql = `
            -- Drop existing permissive policy if any (unlikely, but safe)
            DROP POLICY IF EXISTS "Public can view app settings" ON public.app_settings;
            
            -- Create policy allowing anyone to read app_settings
            CREATE POLICY "Public can view app settings"
                ON public.app_settings FOR SELECT
                USING (true);
        `;

        await client.query(sql);
        console.log('Successfully added SELECT policy for app_settings!');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
