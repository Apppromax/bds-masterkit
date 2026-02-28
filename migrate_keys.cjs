const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }


const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to Supabase for Migration...');
        await client.connect();

        console.log('Creating api_keys and api_logs tables...');

        // Execute the SQL creation commands
        await client.query(`
            -- 7. API Key Management (Advanced Pool)
            CREATE TABLE IF NOT EXISTS public.api_keys (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              provider TEXT NOT NULL, -- 'gemini', 'openai', 'stability'
              key_value TEXT NOT NULL, 
              name TEXT, 
              is_active BOOLEAN DEFAULT TRUE,
              usage_count BIGINT DEFAULT 0,
              last_used_at TIMESTAMPTZ,
              is_rate_limited BOOLEAN DEFAULT FALSE,
              rate_limit_reset_at TIMESTAMPTZ,
              tier TEXT DEFAULT 'free', 
              error_count INT DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- RLS for API Keys
            ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

            DO $$ BEGIN
                CREATE POLICY "Admins can manage api keys"
                ON public.api_keys FOR ALL
                USING (
                    EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                    )
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            -- 8. API Logs (History)
            CREATE TABLE IF NOT EXISTS public.api_logs (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              user_id UUID REFERENCES public.profiles(id),
              provider TEXT,
              model TEXT,
              endpoint TEXT,
              status_code INT,
              duration_ms INT,
              prompt_preview TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- RLS for API Logs
            ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

            DO $$ BEGIN
                CREATE POLICY "Admins can view all logs"
                ON public.api_logs FOR SELECT
                USING (
                    EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                    )
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                CREATE POLICY "Users can view own logs"
                ON public.api_logs FOR SELECT
                USING (auth.uid() = user_id);
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        console.log('✅ Tables created successfully.');
    } catch (err) {
        console.error('❌ Error executing migration:', err.message);
    } finally {
        await client.end();
        console.log('Done.');
    }
}

run();
