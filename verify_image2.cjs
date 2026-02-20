const fs = require('fs');
require('dotenv').config({ path: 'd:/App/.env' });

async function verifyGeminiImage() {
    const key = process.env.VITE_GEMINI_API_KEY;
    if (!key) {
        console.log('No key available in env');
        return;
    }

    // 1x1 black pixel PNG
    const blankBase = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    // Test with camelCase (inlineData, mimeType)
    const reqBodyCamel = {
        contents: [{
            parts: [
                { text: "Change the background to red." },
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: blankBase
                    }
                }
            ]
        }]
    };

    // Test with snake_case (inline_data, mime_type)
    const reqBodySnake = {
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
        }]
    };

    console.log("--- Testing CamelCase ---");
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBodyCamel)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(data).substring(0, 300));
    } catch (err) { console.error('Error:', err.message); }

    console.log("\n--- Testing snake_case ---");
    try {
        const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBodySnake)
        });
        const data2 = await res2.json();
        console.log("Status:", res2.status);
        console.log("Response:", JSON.stringify(data2).substring(0, 300));
    } catch (err) { console.error('Error:', err.message); }

    console.log("\n--- Testing 2.5 flash image with snake case ---");
    try {
        const res3 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBodySnake)
        });
        const data3 = await res3.json();
        console.log("Status:", res3.status);
        console.log("Response:", JSON.stringify(data3).substring(0, 300));
    } catch (err) { console.error('Error:', err.message); }

}

verifyGeminiImage();
