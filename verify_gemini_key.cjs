const { Client } = require('pg');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const keys = await client.query("SELECT key_value FROM public.api_keys WHERE provider = 'gemini' LIMIT 1");
        if (keys.rows.length > 0) {
            const val = keys.rows[0].key_value;
            console.log('Gemini key exists. Length:', val ? val.length : 0);
            if (val && val.length > 5) {
                console.log('Key starts with:', val.substring(0, 5) + '...');
            }
        } else {
            console.log('No Gemini key found.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
