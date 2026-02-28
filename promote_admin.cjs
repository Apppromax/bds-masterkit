const { Client } = require('pg');

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
        await client.connect();
        console.log('Connected!');

        console.log('--- Current Users in Profiles ---');
        const result = await client.query('SELECT id, email, full_name, role FROM public.profiles');
        console.table(result.rows);

        if (result.rows.length > 0) {
            // Find a user to make admin if none exists
            const hasAdmin = result.rows.some(r => r.role === 'admin');
            if (!hasAdmin) {
                const target = result.rows[0];
                console.log(`Promoting ${target.email} to admin...`);
                await client.query('UPDATE public.profiles SET role = $1 WHERE id = $2', ['admin', target.id]);
                console.log('Success!');
            } else {
                console.log('Admin already exists.');
            }
        } else {
            console.log('No users found. Go to https://bds-masterkit.vercel.app/signup and create an account first!');
        }

        // Try to create the missing app_settings table if it doesn't exist
        console.log('Checking app_settings table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.app_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
      CREATE POLICY "Admins can manage app settings"
        ON public.app_settings FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );
    `).catch(e => console.log('Notice: app_settings check skipped or already exists.'));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
