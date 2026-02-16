const { Client } = require('pg');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function promoteSpecificAdmin(email) {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to Supabase DB');

        // Find the user ID based on email from auth.users (linked to public.profiles)
        // Actually, profiles table uses the same ID as auth.users.
        // We can join or just guess if the email is stored in profiles.

        // First, let's see if the user is in the profiles table
        const checkRes = await client.query('SELECT id, full_name, role FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE email = $1)', [email]);

        if (checkRes.rows.length === 0) {
            console.log(`User with email ${email} not found in profiles. Trying to find in auth.users...`);
            const authRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);

            if (authRes.rows.length === 0) {
                console.error(`User ${email} does not exist in Auth system.`);
                return;
            }

            const userId = authRes.rows[0].id;
            console.log(`Found User ID: ${userId}. Creating profile as admin...`);
            await client.query(
                'INSERT INTO public.profiles (id, full_name, role, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (id) DO UPDATE SET role = $3',
                [userId, 'Admin User', 'admin']
            );
        } else {
            const userId = checkRes.rows[0].id;
            console.log(`Updating user ${email} (ID: ${userId}) to admin role...`);
            await client.query('UPDATE public.profiles SET role = \'admin\' WHERE id = $1', [userId]);
        }

        console.log(`SUCCESS: ${email} is now an ADMIN.`);
    } catch (err) {
        console.error('Error promoting admin:', err.message);
    } finally {
        await client.end();
    }
}

promoteSpecificAdmin('chientran64@gmail.com');
