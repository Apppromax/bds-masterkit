import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.VITE_GEMINI_API_KEY || '';

async function testGemini() {
    console.log("Testing gemini-3.1-flash-image-preview on generateContent endpoint...");
    const baseImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: "Change the background to red." },
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: baseImage
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "image/jpeg"
            }
        })
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

testGemini();
