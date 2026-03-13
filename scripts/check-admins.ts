import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const prof = await client.query(`SELECT id, full_name, email, role, credits FROM profiles WHERE role = 'admin'`);
    console.log("Admin Profiles: ", prof.rows);

    await client.end();
}
check();
