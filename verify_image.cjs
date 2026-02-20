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

    const reqBody = {
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
        }],
        // responseModalities not strictly required if model is explicitly an image model? Let's check with and without
    };

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });
        const data = await res.json();
        console.log("Response from gemini-2.5-flash:", JSON.stringify(data).substring(0, 300));
    } catch (err) { console.error('Error flash:', err); }

    try {
        const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });
        const data2 = await res2.json();
        console.log("Response from gemini-2.5-flash-image:", JSON.stringify(data2).substring(0, 300));
    } catch (err) { console.error('Error flash-image:', err); }
}

verifyGeminiImage();
