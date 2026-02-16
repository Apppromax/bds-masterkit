import { supabase } from '../lib/supabaseClient';

export async function generateContentWithAI(prompt: string): Promise<string | null> {
    // 1. Try to get Gemini Key first (Preferred & Cheaper)
    let { data: geminiKey } = await supabase.rpc('get_best_api_key', { p_provider: 'gemini' });

    if (geminiKey) {
        try {
            // Call Google Gemini API (Imagen 3 / Pro)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (err) {
            console.error('Gemini API Error:', err);
            // Fallback to OpenAI if Gemini fails
        }
    }

    // 2. Fallback to OpenAI Key
    let { data: openaiKey } = await supabase.rpc('get_best_api_key', { p_provider: 'openai' });

    if (openaiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'Bạn là chuyên viên Content Marketing Bất động sản chuyên nghiệp tại Việt Nam.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (err) {
            console.error('OpenAI API Error:', err);
        }
    }

    console.warn('No active API keys found (Gemini or OpenAI).');
    return null;
}

export async function generateImageWithAI(prompt: string): Promise<string | null> {
    // 1. Try Stability AI Key
    let { data: stabilityKey } = await supabase.rpc('get_best_api_key', { p_provider: 'stability' });

    if (stabilityKey) {
        try {
            console.log('Attempting Stability AI...');
            const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${stabilityKey}`
                },
                body: JSON.stringify({
                    text_prompts: [{ text: prompt }],
                    cfg_scale: 7,
                    height: 1024,
                    width: 1024,
                    steps: 30,
                    samples: 1,
                })
            });

            const data = await response.json();
            if (response.ok && data.artifacts && data.artifacts.length > 0) {
                return `data:image/png;base64,${data.artifacts[0].base64}`;
            } else if (!response.ok) {
                console.error('Stability API Error Detail:', data);
            }
        } catch (err) {
            console.error('Stability API catch:', err);
        }
    }

    // 2. Try Google Gemini (Imagen 3)
    let { data: geminiKey } = await supabase.rpc('get_best_api_key', { p_provider: 'gemini' });
    if (geminiKey) {
        try {
            console.log('Attempting Google Imagen 3...');
            // Standard AI Studio endpoint for Imagen 3
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt }],
                    parameters: { sampleCount: 1 }
                })
            });

            const data = await response.json();
            if (response.ok && data.predictions && data.predictions.length > 0) {
                return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
            } else if (!response.ok) {
                console.error('Gemini Imagen Error Detail:', data);
                // Throw specific error to be caught by UI
                if (data.error?.message) {
                    throw new Error(`Google AI: ${data.error.message}`);
                }
            }
        } catch (err: any) {
            console.error('Gemini Imagen catch:', err);
            if (err.message?.includes('Google AI')) throw err;
        }
    }

    // 3. Try OpenAI (DALL-E 3)
    let { data: openaiKey } = await supabase.rpc('get_best_api_key', { p_provider: 'openai' });
    if (openaiKey) {
        try {
            console.log('Attempting OpenAI DALL-E 3...');
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                })
            });

            const data = await response.json();
            if (response.ok && data.data && data.data.length > 0) {
                return data.data[0].url;
            } else if (!response.ok) {
                console.error('OpenAI Error Detail:', data);
                if (data.error?.message) {
                    throw new Error(`OpenAI: ${data.error.message}`);
                }
            }
        } catch (err: any) {
            console.error('OpenAI catch:', err);
            if (err.message?.includes('OpenAI')) throw err;
        }
    }

    const errorMsg = 'Không tìm thấy API Key khả dụng hoặc các API đều lỗi. Sếp kiểm tra lại chìa khóa trong Admin nhé!';
    console.warn(errorMsg);
    throw new Error(errorMsg);
}
