const { Client } = require('pg');

// Credentials from setup_db.cjs
const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to Supabase to fix RLS Policies...');
        await client.connect();

        // 1. Fix Profiles Update Policy for Admins
        console.log('Adding "Admins can update all profiles" policy...');
        await client.query(`
            DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
            CREATE POLICY "Admins can update all profiles"
              ON public.profiles
              FOR UPDATE
              USING (
                EXISTS (
                  SELECT 1 FROM public.profiles
                  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
              );
        `);
        console.log('✅ Policy added/updated.');

        // 2. Ensure Admin role for current user (optional, but good for verification)
        // We won't do this automatically as the Profile page has a button now.

    } catch (err) {
        console.error('❌ Error updating RLS:', err.message);
    } finally {
        await client.end();
        console.log('Done.');
    }
}

run();
