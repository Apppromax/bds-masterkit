/**
 * Quick test: Gemini 2.0 Flash Image Generation (FREE)
 */
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL in .env.local'); process.exit(1); }

async function run() {
    const pgClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await pgClient.connect();

    const res = await pgClient.query("SELECT key_value FROM api_keys WHERE provider = 'gemini' AND is_active = true LIMIT 1");
    const geminiKey = res.rows[0]?.key_value;
    await pgClient.end();

    if (!geminiKey) { console.error('No gemini key'); return; }

    console.log('Testing Gemini 2.0 Flash Image Generation (FREE)...');
    const prompt = 'High-end real estate photography: A modern luxury villa with swimming pool and tropical garden, photorealistic, 8k, sharp focus, absolutely NO text, NO letters, NO watermark';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
        })
    });

    const data = await response.json();
    console.log('Status:', response.status);

    if (response.ok && data.candidates?.[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                console.log(`✅ SUCCESS! Image generated! Size: ${(part.inlineData.data.length / 1024).toFixed(0)} KB`);
                console.log(`MIME: ${part.inlineData.mimeType}`);
                return;
            }
            if (part.text) {
                console.log('Text response:', part.text.substring(0, 200));
            }
        }
        console.log('⚠️ No image data in response parts.');
    } else {
        console.log('❌ Failed:', JSON.stringify(data).substring(0, 500));
    }
}

run().catch(console.error);
