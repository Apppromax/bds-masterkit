const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('Connected!');

        const sqlPath = path.join(__dirname, 'standardize_profile_fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing standardization SQL...');
        await client.query(sql);

        console.log('Database columns added successfully!');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
