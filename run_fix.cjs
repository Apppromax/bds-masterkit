const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string from setup_db.cjs
const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        console.log('Connecting to Supabase (Mumbai Pooler)...');
        await client.connect();
        console.log('Connected successfully!');

        const sqlPath = path.join(__dirname, 'fix_profile_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing fix_profile_schema.sql...');
        await client.query(sql);
        console.log('Schema fix applied successfully!');

    } catch (err) {
        console.error('Error:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
    } finally {
        await client.end();
    }
}

run();
