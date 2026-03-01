import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to Database. Adding columns...');

        await client.query(`
            ALTER TABLE api_logs 
            ADD COLUMN IF NOT EXISTS token_count integer DEFAULT 0,
            ADD COLUMN IF NOT EXISTS estimated_cost numeric(12, 6) DEFAULT 0;
        `);

        console.log('Migration successful: token_count and estimated_cost columns added.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
