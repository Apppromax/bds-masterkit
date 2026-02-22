const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

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
