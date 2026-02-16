const { Client } = require('pg');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkKeys() {
    try {
        await client.connect();
        console.log('Connected to DB check keys...');

        console.log('--- api_keys Table ---');
        const resKeys = await client.query('SELECT provider, name, is_active, usage_count, tier FROM public.api_keys');
        console.table(resKeys.rows);

        console.log('--- app_settings Table ---');
        const resSettings = await client.query('SELECT key, value FROM public.app_settings WHERE key LIKE \'%_key%\'');
        console.table(resSettings.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkKeys();
