const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

        const sqlPath = path.join(__dirname, 'security_audit_fixes.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying Security Audit Fixes...');
        await client.query(sql);
        console.log('Security policies tightened successfully!');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
