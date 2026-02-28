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
        console.log('Checking database status...');

        // Check Auth User
        const authUser = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [targetEmail]);
        if (authUser.rows.length === 0) {
            console.log('User not found in auth.users');
            return;
        }
        const uid = authUser.rows[0].id;
        console.log(`Auth UID: ${uid}`);

        // Check Profile
        const profile = await client.query('SELECT * FROM public.profiles WHERE id = $1', [uid]);
        if (profile.rows.length === 0) {
            console.log('Profile NOT FOUND in public.profiles. Attempting to create...');
            await client.query(
                "INSERT INTO public.profiles (id, email, full_name, role, tier) VALUES ($1, $2, 'Trần Hữu Chiến', 'admin', 'pro')",
                [uid, targetEmail]
            );
            console.log('Profile created successfully.');
        } else {
            console.log('Profile found:', profile.rows[0]);
            if (profile.rows[0].role !== 'admin' || profile.rows[0].tier !== 'pro') {
                console.log('Updating profile to Admin/Pro...');
                await client.query(
                    "UPDATE public.profiles SET role = 'admin', tier = 'pro', full_name = 'Trần Hữu Chiến' WHERE id = $1",
                    [uid]
                );
                console.log('Profile updated successfully.');
            }
        }

        // Verify RLS - sometimes policies cache or are misconfigured
        console.log('Verifying RLS policies...');
        const policies = await client.query("SELECT * FROM pg_policies WHERE tablename = 'profiles'");
        console.table(policies.rows.map(p => ({ name: p.policyname, definition: p.definition })));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
