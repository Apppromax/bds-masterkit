const { Client } = require('pg');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('--- Checking for duplicate emails in auth.users ---');
        const duplicates = await client.query('SELECT email, count(*) FROM auth.users GROUP BY email HAVING count(*) > 1');
        console.table(duplicates.rows);

        console.log('--- Checking for profiles with chientran64 email ---');
        const profiles = await client.query("SELECT * FROM public.profiles WHERE email ILIKE '%chientran64%'");
        console.table(profiles.rows);

        console.log('--- Checking exact match in auth.users ---');
        const authUsers = await client.query("SELECT id, email, created_at FROM auth.users WHERE email = 'chientran64@gmail.com'");
        console.table(authUsers.rows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
