import { getAppSetting } from './settingsService';

export async function generateContentWithAI(prompt: string): Promise<string | null> {
    const apiKey = await getAppSetting('openai_api_key');
    if (!apiKey) {
        console.warn('OpenAI API Key not found');
        return null;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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
        console.error('AI Generation Error:', err);
        return null;
    }
}

export async function generateImageWithAI(prompt: string): Promise<string | null> {
    const apiKey = await getAppSetting('stability_api_key');
    if (!apiKey) {
        console.warn('Stability AI Key not found');
        return null;
    }

    try {
        // Example for Stability AI API (SDXL or similar)
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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
        if (data.artifacts && data.artifacts.length > 0) {
            return `data:image/png;base64,${data.artifacts[0].base64}`;
        }
        return null;
    } catch (err) {
        console.error('Image AI Error:', err);
        return null;
    }
}
