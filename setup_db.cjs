const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }

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

        const sqlPath = path.join(__dirname, 'supabase_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing schema SQL (Batch execution)...');
        // We execute the entire file at once to preserve PL/pgSQL function syntax
        await client.query(sql);

        console.log('Database schema synchronized successfully!');

        // Check for users to promote to admin
        const result = await client.query('SELECT id, email FROM public.profiles');
        if (result.rows.length > 0) {
            console.log('Found users:', result.rows.map(r => r.email).join(', '));
            // Promote the first user to admin if needed
            const firstUser = result.rows[0];
            await client.query('UPDATE public.profiles SET role = $1 WHERE id = $2', ['admin', firstUser.id]);
            console.log(`Promoted ${firstUser.email} to ADMIN.`);
        } else {
            console.log('No users found in profiles table yet. Sign up first on the website!');
        }

    } catch (err) {
        console.error('Error:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
    } finally {
        await client.end();
    }
}

run();
