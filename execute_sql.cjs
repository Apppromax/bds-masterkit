const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function run() {
    const sqlFile = process.argv[2];
    if (!sqlFile) {
        console.error('Please specify a SQL file name.');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log(`Connected. Executing ${sqlFile}...`);

        const sql = fs.readFileSync(path.join(__dirname, sqlFile), 'utf8');
        await client.query(sql);

        console.log('Execution completed successfully!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
