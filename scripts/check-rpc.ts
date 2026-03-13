import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query(`SELECT prosrc FROM pg_proc WHERE proname = 'deduct_credits_secure'`);
    if (res.rows.length > 0) {
        console.log(res.rows[0].prosrc);
    } else {
        console.log("NOT FOUND");
    }

    // Also, query the user profile to see if they are 'admin'
    const prof = await client.query(`SELECT id, full_name, email, role, credits FROM profiles ORDER BY created_at DESC LIMIT 5`);
    console.log("Profiles: ", prof.rows);

    await client.end();
}
check();
