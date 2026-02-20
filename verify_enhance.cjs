const fs = require('fs');
require('dotenv').config({ path: 'd:/App/.env' });

async function verifyEnhance() {
    const key = process.env.VITE_GEMINI_API_KEY;
    if (!key) {
        // try to fetch from supabase? we don't have .env with the exact key, maybe check_keys.cjs has it.
        console.log('No key, try passing the key or fetch from db');
    }

    try {
        // We will generate a simple blank image, encode in base64
        const blankBase = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        const reqBody = {
            contents: [{
                parts: [
                    { text: "Change the background to red." },
                    {
                        inline_data: {
                            mime_type: 'image/png',
                            data: blankBase
                        }
                    }
                ]
            }],
            generationConfig: {
                responseModalities: ['IMAGE']
            }
        };

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.argv[2]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });

        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));

    } catch (err) {
        console.error(err);
    }
}

verifyEnhance();
