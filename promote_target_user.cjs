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
        console.log('Connected to Database!');

        const result = await client.query('SELECT id, email, role, tier FROM public.profiles WHERE email = $1', [targetEmail]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log(`Current state for ${targetEmail}: Role=${user.role}, Tier=${user.tier}`);

            console.log(`Promoting ${targetEmail} to ADMIN and PRO...`);
            await client.query(
                'UPDATE public.profiles SET role = $1, tier = $2 WHERE id = $3',
                ['admin', 'pro', user.id]
            );
            console.log('Update Successful!');
        } else {
            console.log(`User ${targetEmail} not found in profiles table. Please make sure you have signed up.`);
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
