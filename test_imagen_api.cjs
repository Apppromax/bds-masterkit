/**
 * Direct diagnostic: Check DB + Test Imagen 4.0 API
 */
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }

async function run() {
    const pgClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await pgClient.connect();

    console.log('=== IMAGEN 4.0 DIAGNOSTIC ===\n');

    // Step 1: Check api_keys table
    console.log('📡 Step 1: Checking api_keys table...');
    try {
        const res = await pgClient.query("SELECT id, provider, name, is_active, usage_count, error_count, tier, LEFT(key_value, 8) as key_prefix, RIGHT(key_value, 4) as key_suffix, LENGTH(key_value) as key_length FROM api_keys ORDER BY created_at DESC");
        if (res.rows.length === 0) {
            console.error('❌ NO KEYS IN DATABASE! Table api_keys is empty.');
            await pgClient.end();
            return;
        }
        console.log(`✅ Found ${res.rows.length} key(s):`);
        res.rows.forEach(k => {
            console.log(`   [${k.provider}] ${k.name} | Active: ${k.is_active} | Usage: ${k.usage_count} | Errors: ${k.error_count} | Tier: ${k.tier} | Key: ${k.key_prefix}...${k.key_suffix} (${k.key_length} chars)`);
        });

        // Get the actual gemini key for testing
        const geminiRow = res.rows.find(k => k.provider === 'gemini' && k.is_active);
        if (!geminiRow) {
            console.error('\n❌ No ACTIVE gemini key found!');
            await pgClient.end();
            return;
        }

        // Get full key
        const fullKeyRes = await pgClient.query("SELECT key_value FROM api_keys WHERE provider = 'gemini' AND is_active = true LIMIT 1");
        const geminiKey = fullKeyRes.rows[0].key_value;

        // Step 2: Test RPC function
        console.log('\n📡 Step 2: Testing get_best_api_key RPC...');
        try {
            const rpcRes = await pgClient.query("SELECT get_best_api_key('gemini')");
            const rpcKey = rpcRes.rows[0]?.get_best_api_key;
            if (rpcKey) {
                console.log(`✅ RPC returns key: ${rpcKey.substring(0, 8)}...`);
            } else {
                console.error('❌ RPC returned NULL!');
            }
        } catch (rpcErr) {
            console.error('❌ RPC ERROR:', rpcErr.message);
        }

        // Step 3: Test Imagen API with both methods
        console.log('\n📡 Step 3: Testing Imagen 4.0 API...');
        const prompt = 'A modern luxury villa with swimming pool, tropical garden, daytime, photorealistic';
        const models = ['imagen-4.0-generate-001', 'imagen-4.0-fast-generate-001'];

        for (const modelId of models) {
            console.log(`\n--- Testing: ${modelId} ---`);

            // Method A: x-goog-api-key header
            console.log('  [A] x-goog-api-key header...');
            try {
                const resA = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
                    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
                });
                const dataA = await resA.json();
                console.log(`  Status: ${resA.status}`);
                if (resA.ok && dataA.predictions?.[0]?.bytesBase64Encoded) {
                    console.log(`  ✅ SUCCESS! Image size: ${(dataA.predictions[0].bytesBase64Encoded.length / 1024).toFixed(0)} KB`);
                } else {
                    console.log(`  ❌ Response:`, JSON.stringify(dataA).substring(0, 400));
                }
            } catch (e) { console.error(`  ❌ Error:`, e.message); }

            // Method B: ?key= query param
            console.log('  [B] ?key= query param...');
            try {
                const resB = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
                });
                const dataB = await resB.json();
                console.log(`  Status: ${resB.status}`);
                if (resB.ok && dataB.predictions?.[0]?.bytesBase64Encoded) {
                    console.log(`  ✅ SUCCESS! Image size: ${(dataB.predictions[0].bytesBase64Encoded.length / 1024).toFixed(0)} KB`);
                } else {
                    console.log(`  ❌ Response:`, JSON.stringify(dataB).substring(0, 400));
                }
            } catch (e) { console.error(`  ❌ Error:`, e.message); }
        }

    } catch (dbErr) {
        console.error('❌ DB Error:', dbErr.message);
    }

    await pgClient.end();
    console.log('\n=== DIAGNOSTIC COMPLETE ===');
}

run().catch(console.error);
