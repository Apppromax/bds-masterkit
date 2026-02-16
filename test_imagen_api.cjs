// Test trực tiếp Google Imagen API với key thật từ database
const { Client } = require('pg');

const connectionString = 'postgresql://postgres.bqbywxhkifuwjutswsta:JF2AiAZmLvtuxQda@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function testImagen() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    // Lấy key từ DB
    const res = await client.query("SELECT key_value FROM public.api_keys WHERE provider = 'gemini' AND is_active = true LIMIT 1");
    await client.end();

    if (!res.rows.length) {
        console.error('NO GEMINI KEY FOUND IN DB');
        return;
    }

    const apiKey = res.rows[0].key_value;
    console.log('Got API key:', apiKey.substring(0, 10) + '...');

    // Thử từng model
    const models = [
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001',
        'imagen-3.0-generate-001',
        'gemini-2.0-flash-exp',
    ];

    for (const model of models) {
        console.log(`\n--- Testing model: ${model} ---`);
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
            const body = {
                instances: [{ prompt: 'A modern 2-story villa with swimming pool, architectural photography, 8k' }],
                parameters: { sampleCount: 1 }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            console.log('Status:', response.status);

            if (response.ok) {
                console.log('SUCCESS! Response keys:', Object.keys(data));
                if (data.predictions?.[0]) {
                    const pred = data.predictions[0];
                    const hasImage = pred.bytesBase64Encoded ? 'YES (bytesBase64Encoded)' : 'NO';
                    console.log('Has image data:', hasImage);
                    if (pred.bytesBase64Encoded) {
                        console.log('Image data length:', pred.bytesBase64Encoded.length, 'chars');
                    }
                    console.log('Prediction keys:', Object.keys(pred));
                }
            } else {
                console.log('FAILED:', data.error?.message || JSON.stringify(data).substring(0, 200));
            }
        } catch (err) {
            console.log('CATCH ERROR:', err.message);
        }
    }

    // Thử generateContent endpoint (Gemini text model có thể generate image?)
    console.log('\n--- Testing Gemini generateContent for image ---');
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
        const body = {
            contents: [{
                parts: [{ text: 'Generate an image of a modern 2-story villa with swimming pool' }]
            }],
            generationConfig: {
                responseModalities: ["IMAGE", "TEXT"]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Status:', response.status);

        if (response.ok) {
            console.log('SUCCESS! Response keys:', Object.keys(data));
            const parts = data.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    console.log('Part keys:', Object.keys(part));
                    if (part.inlineData) {
                        console.log('GOT IMAGE! mimeType:', part.inlineData.mimeType, 'data length:', part.inlineData.data?.length);
                    }
                    if (part.text) {
                        console.log('Text:', part.text.substring(0, 100));
                    }
                }
            }
        } else {
            console.log('FAILED:', data.error?.message || JSON.stringify(data).substring(0, 300));
        }
    } catch (err) {
        console.log('CATCH ERROR:', err.message);
    }

    // Thử list models để xem key có quyền gì
    console.log('\n--- Listing available Imagen models ---');
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            const imagenModels = data.models.filter(m => m.name.includes('imagen'));
            console.log('Imagen models available:', imagenModels.length);
            imagenModels.forEach(m => {
                console.log(`  - ${m.name} (methods: ${m.supportedGenerationMethods?.join(', ')})`);
            });

            // Cũng check cho gemini-2.0-flash-exp
            const flashExp = data.models.find(m => m.name.includes('gemini-2.0-flash-exp'));
            if (flashExp) {
                console.log(`\n  Flash Exp: ${flashExp.name} (methods: ${flashExp.supportedGenerationMethods?.join(', ')})`);
            }
        }
    } catch (err) {
        console.log('CATCH ERROR:', err.message);
    }
}

testImagen();
