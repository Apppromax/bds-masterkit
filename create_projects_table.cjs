const { Client } = require('pg');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

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

        console.log('Creating projects table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        title TEXT NOT NULL,
        price TEXT,
        location TEXT,
        description TEXT,
        status TEXT DEFAULT 'available',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'projects' AND policyname = 'Users can manage their own projects'
        ) THEN
          CREATE POLICY "Users can manage their own projects"
            ON public.projects FOR ALL
            USING (auth.uid() = user_id);
        END IF;
      END $$;
    `);
        console.log('Projects table ready!');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
