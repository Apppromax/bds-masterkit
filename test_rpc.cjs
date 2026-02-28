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
        await client.connect();

        console.log('--- Testing get_best_api_key RPC via PG ---');
        const res = await client.query("SELECT get_best_api_key('gemini') as key");
        console.log('Result for gemini:', res.rows[0].key ? 'FOUND (starts with ' + res.rows[0].key.substring(0, 5) + '...)' : 'NOT FOUND');

        const res2 = await client.query("SELECT get_best_api_key('stability') as key");
        console.log('Result for stability:', res2.rows[0].key ? 'FOUND' : 'NOT FOUND');

        const res3 = await client.query("SELECT get_best_api_key('openai') as key");
        console.log('Result for openai:', res3.rows[0].key ? 'FOUND' : 'NOT FOUND');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
