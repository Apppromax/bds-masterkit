const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }
const targetEmail = 'chientran64@gmail.com';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('--- Auth Users ---');
        const authResult = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [targetEmail]);
        console.table(authResult.rows);

        console.log('--- Public Profiles ---');
        const profileResult = await client.query('SELECT id, email, full_name, role, tier FROM public.profiles WHERE email = $1', [targetEmail]);
        console.table(profileResult.rows);

        if (authResult.rows.length > 0 && profileResult.rows.length > 0) {
            const authUser = authResult.rows[0];
            const profile = profileResult.rows[0];

            if (authUser.id !== profile.id) {
                console.log('🚨 DISCREPANCY DETECTED: Auth ID and Profile ID do not match!');
                console.log(`Auth ID: ${authUser.id}`);
                console.log(`Profile ID: ${profile.id}`);

                console.log('Fixing Profile ID to match Auth User ID...');
                await client.query('UPDATE public.profiles SET id = $1 WHERE email = $2', [authUser.id, targetEmail]);
                console.log('Fix applied!');
            } else {
                console.log('IDs match correctly.');
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
