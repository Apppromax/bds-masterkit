const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }

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
