import { supabase } from '../lib/supabaseClient';

async function saveApiLog(data: {
    provider: string;
    model: string;
    endpoint: string;
    status_code: number;
    duration_ms: number;
    prompt_preview: string;
}) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { error } = await supabase.from('api_logs').insert({
            user_id: session.user.id,
            ...data
        });

        if (error) {
            console.warn('[Log] RLS/Database error:', error.message);
        } else {
            console.log('[Log] API usage tracked successfully');
        }
    } catch (err) {
        console.error('[Log] Failed to save API log:', err);
    }
}

async function getApiKey(provider: string): Promise<string | null> {
    try {
        console.log(`[AI] Fetching best key for: ${provider}`);
        const { data, error } = await supabase.rpc('get_best_api_key', { p_provider: provider });

        if (error) {
            console.error(`[AI] RPC Error (${provider}):`, error.message, error.details);
            // If it's a transient session issue, a quick retry might help
            if (error.message.includes('JWT') || error.message.includes('session')) {
                console.log(`[AI] Retrying ${provider} after potential auth race...`);
                const retry = await supabase.rpc('get_best_api_key', { p_provider: provider });
                if (retry.data) return retry.data;
            }
            return null;
        }

        if (!data) {
            console.warn(`[AI] No active key found in pool for: ${provider}. Retrying once...`);
            // Quick retry for cold start
            await new Promise(r => setTimeout(r, 800));
            const retry = await supabase.rpc('get_best_api_key', { p_provider: provider });
            if (retry.data) {
                console.log(`[AI] Retry successful for ${provider}`);
                return retry.data;
            }

            console.error(`[AI] Final check: No keys for ${provider}`);
            return null;
        }

        return data;
    } catch (err) {
        console.error(`[AI] Fatal error fetching key (${provider}):`, err);
        return null;
    }
}

export async function generateContentWithAI(
    prompt: string,
    options?: { channel?: string, audience?: string, style?: string, multiOption?: boolean, name?: string, phone?: string }
): Promise<string | null> {
    const startTime = Date.now();

    const styleGuide: Record<string, string> = {
        professional: 'Phong cách chuyên nghiệp, trang trọng, ngôn từ chuẩn mực, đầy đủ thông tin kỹ thuật.',
        urgent: 'Phong cách khẩn cấp, hối thúc, sử dụng các từ mạnh như "Cắt lỗ", "Bán gấp", "Chốt ngay", "Cơ hội duy nhất".',
        funny: 'Phong cách hài hước, dí dỏm, sử dụng các câu ví von thú vị, các trend mạng xã hội nếu phù hợp.',
        sincere: 'Phong cách chân thành, tâm huyết, chia sẻ thật lòng về giá trị của BĐS.',
        story: 'Phong cách kể chuyện (storytelling), dẫn dắt người đọc vào một trải nghiệm sống hoặc đầu tư thực tế.'
    };

    // Build specialized system instructions
    const systemPrompt = `Bạn là một chuyên gia Content Marketing Bất động sản cao cấp tại Việt Nam. 
Nhiệm vụ: Tạo nội dung quảng cáo có tỷ lệ chuyển đổi cao.
${options?.style ? `Giọng văn yêu cầu: ${styleGuide[options.style] || options.style}.` : ''}
${options?.channel ? `Kênh phát hành: ${options.channel.toUpperCase()}. Tối ưu hóa định dạng và ngôn ngữ cho kênh này.` : ''}
${options?.audience === 'investor' ? 'Đối tượng mục tiêu: Nhà đầu tư. Tập trung vào: Lợi nhuận, tiềm năng tăng giá, pháp lý, vị trí chiến lược, tính thanh khoản.' : ''}
${options?.audience === 'homeseeker' ? 'Đối tượng mục tiêu: Khách mua ở. Tập trung vào: Tiện ích, không gian sống, môi trường xung quanh, cảm xúc tổ ấm, sự tiện nghi cho gia đình.' : ''}
Yêu cầu: Sử dụng Emoji khéo léo, Headline giật gân, Call-to-Action mạnh mẽ. Chia rõ các phần bằng xuống dòng.
${options?.phone ? `THÔNG TIN LIÊN HỆ BẮT BUỘC: Bạn PHẢI chèn dòng "${options.name || 'Admin'} - ${options.phone}" (kèm icon điện thoại đẹp mắt) vào cuối **MỖI** phương án nội dung (trước khi sang phương án tiếp theo, nếu có nhiều phương án).` : ''}`;

    let fullPrompt = `${systemPrompt}\n\nThông tin chi tiết:\n${prompt}`;

    if (options?.multiOption) {
        fullPrompt += `\n\nHãy tạo 3 phương án nội dung khác nhau. QUAN TRỌNG: Ngăn cách giữa các phương án bằng chuỗi "---SPLIT---". TUYỆT ĐỐI KHÔNG được viết các từ như "Phương án 1", "Mẫu 1", "Lựa chọn 1"... ở đầu mỗi nội dung. Hãy vào thẳng tiêu đề bài viết luôn.`;
    }

    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    // 1. Try Gemini
    const geminiKey = await getApiKey('gemini');

    if (geminiKey) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }]
                    })
                });

                if (response.status === 429) {
                    console.warn(`[AI] Gemini 429 Rate Limit (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${retryDelay}ms...`);
                    if (attempt < maxRetries) {
                        await new Promise(r => setTimeout(r, retryDelay));
                        continue;
                    }
                }

                const data = await response.json();
                await saveApiLog({
                    provider: 'gemini',
                    model: 'gemini-2.0-flash',
                    endpoint: 'generateContent',
                    status_code: response.status,
                    duration_ms: Date.now() - startTime,
                    prompt_preview: fullPrompt.substring(0, 100)
                });

                if (data.candidates && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                }
                break; // Exit loop if success or non-retryable error
            } catch (err) {
                console.error('Gemini API Error:', err);
                if (attempt < maxRetries) await new Promise(r => setTimeout(r, retryDelay));
            }
        }
    }

    // 2. Fallback to OpenAI
    const openaiKey = await getApiKey('openai');

    if (openaiKey) {
        const ostartTime = Date.now();
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: fullPrompt }
                        ],
                        temperature: 0.8
                    })
                });

                if (response.status === 429) {
                    console.warn(`[AI] OpenAI 429 Rate Limit (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying...`);
                    if (attempt < maxRetries) {
                        await new Promise(r => setTimeout(r, retryDelay));
                        continue;
                    }
                }

                const data = await response.json();
                await saveApiLog({
                    provider: 'openai',
                    model: 'gpt-3.5-turbo',
                    endpoint: 'chat/completions',
                    status_code: response.status,
                    duration_ms: Date.now() - ostartTime,
                    prompt_preview: fullPrompt.substring(0, 100)
                });

                if (data.choices && data.choices[0]?.message?.content) {
                    return data.choices[0].message.content;
                }
                break;
            } catch (err) {
                console.error('OpenAI API Error:', err);
                if (attempt < maxRetries) await new Promise(r => setTimeout(r, retryDelay));
            }
        }
    }

    console.error('Final failure: No usable keys found for Gemini or OpenAI.');
    return null;
}

export async function analyzeImageWithGemini(base64Image: string): Promise<string | null> {
    const geminiKey = await getApiKey('gemini');

    if (!geminiKey) return null;

    // Clean base64 header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Bạn là một chuyên gia marketing và thiết kế bất động sản. Hãy phân tích bức ảnh này để xác định loại hình BĐS (Đất nền, Nhà thô, Căn hộ/Phòng). Sau đó, hãy viết một Prompt tiếng Anh chi tiết để nâng cấp bức ảnh này sao cho trông 'ăn khách', chân thực, mời gọi và tối đa hóa tiềm năng trong mắt khách hàng mua BĐS. Tránh những chi tiết quá xa rời thực tế. Chỉ trả về Prompt cuối cùng, không giải thích gì thêm." },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: cleanBase64
                            }
                        }
                    ]
                }]
            })
        });

        const data = await response.json();

        // Log usage
        if (data.usageMetadata) {
            console.log('Token Usage:', data.usageMetadata);
        }

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Gemini Vision Error:', data);
            return null;
        }

    } catch (error) {
        console.error('Gemini Vision Fetch Error:', error);
        return null;
    }
}

export async function generateImageWithAI(prompt: string): Promise<string | null> {
    const startTime = Date.now();
    // 1. Try Stability AI
    const stabilityKey = await getApiKey('stability');

    if (stabilityKey) {
        try {
            console.log('Trying Stability AI...');
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

            await saveApiLog({
                provider: 'stability',
                model: 'sdxl-1.0',
                endpoint: 'text-to-image',
                status_code: response.status,
                duration_ms: Date.now() - startTime,
                prompt_preview: prompt.substring(0, 100)
            });

            if (response.ok && data.artifacts && data.artifacts.length > 0) {
                return `data:image/png;base64,${data.artifacts[0].base64}`;
            }
        } catch (err) {
            console.error('Stability API Error:', err);
        }
    }

    // 2. Try Google Imagen (via Gemini API Key)
    const geminiKey = await getApiKey('gemini');
    if (geminiKey) {
        const enhancedPrompt = `High-end real estate photography: ${prompt}, hyper-realistic, 8k resolution, architectural lighting, sharp focus, clean composition, absolutely NO text, NO letters, NO watermark, NO labels, NO signs`;

        // Imagen 4.0 models (Imagen 3 has been shut down by Google)
        const imagenModels = [
            'imagen-4.0-generate-001',
            'imagen-4.0-fast-generate-001',
            'imagen-4.0-ultra-generate-001',
        ];

        for (const modelId of imagenModels) {
            try {
                const iStartTime = Date.now();
                console.log(`[AI] Trying Google ${modelId}...`);

                // CRITICAL: Google Imagen requires x-goog-api-key header, NOT ?key= query param
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': geminiKey
                    },
                    body: JSON.stringify({
                        instances: [{ prompt: enhancedPrompt }],
                        parameters: {
                            sampleCount: 1
                        }
                    })
                });

                const data = await response.json();

                await saveApiLog({
                    provider: 'gemini',
                    model: modelId,
                    endpoint: 'predict',
                    status_code: response.status,
                    duration_ms: Date.now() - iStartTime,
                    prompt_preview: prompt.substring(0, 100)
                });

                if (response.ok && data.predictions && data.predictions.length > 0) {
                    const prediction = data.predictions[0];
                    const base64Data = prediction.bytesBase64Encoded;

                    if (base64Data) {
                        console.log(`[AI] ✅ Image generated with ${modelId}!`);
                        return `data:image/png;base64,${base64Data}`;
                    }
                } else {
                    console.warn(`[AI] ❌ ${modelId} failed (${response.status}):`, data.error?.message || JSON.stringify(data).substring(0, 200));
                }
            } catch (err) {
                console.error(`[AI] ${modelId} catch:`, err);
            }
        }

        // Fallback 2B: Gemini 2.0 Flash (FREE - supports image generation via generateContent)
        console.log('[AI] Imagen requires billing. Trying Gemini 2.0 Flash (free) as fallback...');
        try {
            const gStartTime = Date.now();
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: enhancedPrompt }] }],
                    generationConfig: {
                        responseModalities: ["IMAGE", "TEXT"]
                    }
                })
            });

            const data = await response.json();

            await saveApiLog({
                provider: 'gemini',
                model: 'gemini-2.0-flash-exp-image-generation',
                endpoint: 'generateContent',
                status_code: response.status,
                duration_ms: Date.now() - gStartTime,
                prompt_preview: prompt.substring(0, 100)
            });

            if (response.ok && data.candidates?.[0]?.content?.parts) {
                for (const part of data.candidates[0].content.parts) {
                    if (part.inlineData?.data) {
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        console.log('[AI] ✅ Gemini Flash generated image successfully!');
                        return `data:${mimeType};base64,${part.inlineData.data}`;
                    }
                }
            } else {
                console.warn('[AI] Gemini Flash Image failed:', data.error?.message || JSON.stringify(data).substring(0, 200));
            }
        } catch (err) {
            console.error('[AI] Gemini Flash catch:', err);
        }
    }

    // 3. Try OpenAI DALL-E 3
    const openaiKey = await getApiKey('openai');
    if (openaiKey) {
        const dStartTime = Date.now();
        try {
            console.log('Trying OpenAI DALL-E 3...');
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

            await saveApiLog({
                provider: 'openai',
                model: 'dall-e-3',
                endpoint: 'generations',
                status_code: response.status,
                duration_ms: Date.now() - dStartTime,
                prompt_preview: prompt.substring(0, 100)
            });

            if (response.ok && data.data && data.data.length > 0) {
                return data.data[0].url;
            }
        } catch (err) {
            console.error('OpenAI DALL-E catch:', err);
        }
    }

    throw new Error('Không có API nào tạo được ảnh. Vui lòng kiểm tra API Key trong Admin.');
}
