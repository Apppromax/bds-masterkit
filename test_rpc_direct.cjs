
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
        console.log('Connecting to Supabase...');
        await client.connect();

        console.log('--- Test 1 ---');
        const res1 = await client.query(`SELECT get_best_api_key('gemini') as key`);
        console.log('Key 1:', res1.rows[0].key ? 'FOUND' : 'NULL');

        console.log('--- Waiting 2 seconds ---');
        await new Promise(r => setTimeout(r, 2000));

        console.log('--- Test 2 ---');
        const res2 = await client.query(`SELECT get_best_api_key('gemini') as key`);
        console.log('Key 2:', res2.rows[0].key ? 'FOUND' : 'NULL');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        console.log('Done.');
    }
}

run();
