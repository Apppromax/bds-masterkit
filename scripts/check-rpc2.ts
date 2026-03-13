import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    // Check credit_logs
    const prof = await client.query(`SELECT created_at, user_id, amount, action FROM credit_logs ORDER BY created_at DESC LIMIT 10`);
    console.log("Logs: ", prof.rows);

    await client.end();
}
check();
