import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query(`SELECT prosrc FROM pg_proc WHERE proname = 'deduct_credits_secure'`);
    if (res.rows.length > 0) {
        fs.writeFileSync('scripts/func.sql', res.rows[0].prosrc);
    }
    await client.end();
}
check();
