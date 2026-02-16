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
        // Danh sách các model có thể thử (từ mới nhất đến cũ hơn)
        const modelVariants = [
            'imagen-3.0-generate-002',
            'imagen-3.0-fast-generate-001',
            'imagen-3.0-capability-001',
            'imagen-3.0-generate-001'
        ];

        let errors: string[] = [];

        for (const modelId of modelVariants) {
            try {
                console.log(`Checking Google Imagen model: ${modelId}...`);

                const enhancedPrompt = `High-end real estate photography of: ${prompt}, hyper-realistic, 8k resolution, architectural lighting, sharp focus`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: enhancedPrompt }],
                        parameters: { sampleCount: 1 }
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    const prediction = data.predictions?.[0];
                    const base64Data = prediction?.bytesBase64Encoded || prediction?.content || data.image?.bytesBase64Encoded;

                    if (base64Data) {
                        console.log(`Successfully generated image using ${modelId}`);
                        return `data:image/png;base64,${base64Data}`;
                    }
                    errors.push(`${modelId}: No image data in response`);
                } else {
                    const msg = data.error?.message || JSON.stringify(data);
                    console.warn(`Model ${modelId} failed:`, msg);
                    errors.push(`${modelId}: ${msg}`);
                    // Nếu là lỗi 404 (model not found) thì mới thử tiếp, các lỗi khác (như hết tiền) thì dừng luôn cho nhanh?
                    // Thực tế cứ cho thử hết để chắc chắn.
                    continue;
                }
            } catch (err: any) {
                console.error(`Catch on ${modelId}:`, err);
                errors.push(`${modelId} catch: ${err.message}`);
            }
        }

        // Nếu đã thử hết mà vẫn lỗi, báo cáo tổng hợp
        if (errors.length > 0) {
            const finalError = errors.join(' | ');
            console.error('All Google models failed:', finalError);
            // Chúng ta chỉ quăng lỗi nếu không còn provider nào khác (OpenAI) ở phía dưới
            // Nhưng hiện tại logic là return sớm nếu provider thành công.
            // Nếu Google lỗi, chúng ta cho nó trôi xuống OpenAI.
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
