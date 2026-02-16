const { Client } = require('pg');

const password = 'JF2AiAZmLvtuxQda';
const projectRef = 'bqbywxhkifuwjutswsta';
const host = 'aws-0-ap-southeast-1.pooler.supabase.com';

async function testPooler() {
    console.log(`Testing pooler with project ref in user...`);
    const client = new Client({
        host: host,
        port: 5432,
        user: `postgres.${projectRef}`,
        password: password,
        database: 'postgres',
        connectionTimeoutMillis: 5000,
    });
    try {
        await client.connect();
        console.log(`SUCCESS connected to pooler!`);
        await client.end();
        process.exit(0);
    } catch (e) {
        console.error(`FAILED: ${e.message}`);
        process.exit(1);
    }
}

testPooler();
