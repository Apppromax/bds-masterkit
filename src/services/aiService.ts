import { supabase } from '../lib/supabaseClient';
import { getAppSetting } from './settingsService';
import { geminiGenerate, openaiChat } from './aiProxy';

const isDev = import.meta.env.DEV;

// Race condition guard for credit deduction
let _creditProcessing = false;

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
            if (isDev) console.log('[Log] API usage tracked successfully');
        }
    } catch (err) {
        console.error('[Log] Failed to save API log:', err);
    }
}

export async function checkAndDeductCredits(cost: number, actionName: string): Promise<boolean> {
    // Prevent concurrent credit deductions (race condition guard)
    if (_creditProcessing) {
        if (isDev) console.warn('[Credits] Blocked concurrent deduction attempt');
        return false;
    }
    _creditProcessing = true;

    try {
        if (isDev) console.log(`[Credits] Securely deducting ${cost} for: ${actionName}`);

        // Call the secure server-side RPC
        const { data, error } = await supabase.rpc('deduct_credits_secure', {
            p_cost: cost,
            p_action: actionName
        });

        if (error) {
            console.error('[Credits] RPC Error:', error.message);
            return false;
        }

        if (data && data.success) {
            if (isDev) console.log('[Credits] Deduction successful. Status:', data.message || 'Points deducted');
            return true;
        } else {
            const failMsg = data?.message || 'Unknown reason';
            console.warn('[Credits] Deduction failed:', failMsg);
            // If it's a specific database exception message from our trigger/RPC
            if (failMsg.includes('quyền') || failMsg.includes('số dư')) {
                console.error('[Credits] SECURITY/TRIGGER ERROR:', failMsg);
            }
            return false;
        }
    } catch (err) {
        console.error('[Credits] Fatal error during deduction:', err);
        return false;
    } finally {
        _creditProcessing = false;
    }
}

async function getApiKey(provider: string): Promise<string | null> {
    try {
        if (isDev) console.log(`[AI] Fetching best key for: ${provider}`);
        const { data, error } = await supabase.rpc('get_best_api_key', { p_provider: provider });

        if (error) {
            console.error(`[AI] RPC Error (${provider}):`, error.message, error.details);
            // If it's a transient session issue, a quick retry might help
            if (error.message.includes('JWT') || error.message.includes('session')) {
                if (isDev) console.log(`[AI] Retrying ${provider} after potential auth race...`);
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
                if (isDev) console.log(`[AI] Retry successful for ${provider}`);
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
    const baseTextPrompt = `Bạn là một chuyên gia Content Marketing Bất động sản cao cấp tại Việt Nam. Nhiệm vụ: Tạo nội dung quảng cáo có tỷ lệ chuyển đổi cao.`;

    const systemPrompt = `${baseTextPrompt}
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

    // 1. Try Gemini via Edge Function proxy (key never leaves server)
    try {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const data = await geminiGenerate({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                });

                if (data.candidates && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                }
                break;
            } catch (err: any) {
                if (err.message?.includes('429') && attempt < maxRetries) {
                    console.warn(`[AI] Gemini 429 Rate Limit (Attempt ${attempt + 1}). Retrying...`);
                    await new Promise(r => setTimeout(r, retryDelay));
                    continue;
                }
                console.error('Gemini API Error:', err);
                if (attempt < maxRetries) await new Promise(r => setTimeout(r, retryDelay));
            }
        }
    } catch (e) {
        console.error('[AI] Gemini proxy failed, trying OpenAI fallback...');
    }

    // 2. Fallback to OpenAI via Edge Function proxy
    try {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const data = await openaiChat({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: fullPrompt }
                    ],
                    temperature: 0.8,
                });

                if (data.choices && data.choices[0]?.message?.content) {
                    return data.choices[0].message.content;
                }
                break;
            } catch (err: any) {
                console.error('OpenAI API Error:', err);
                if (attempt < maxRetries) await new Promise(r => setTimeout(r, retryDelay));
            }
        }
    } catch (e) {
        console.error('[AI] OpenAI proxy also failed.');
    }

    console.error('Final failure: No usable keys found for Gemini or OpenAI.');
    return null;
}

export async function generateProContentAI(
    data: {
        type: string,
        location: string,
        area: string,
        price: string,
        legal: string,
        purpose: 'Đầu tư' | 'Để ở',
        channel: string,
        style: string,
        phone?: string,
        name?: string
    }
): Promise<{ content_a: string, content_b: string } | null> {
    const startTime = Date.now();

    const basePrompt = await getAppSetting('ai_content_generator_prompt') || `Bạn là chuyên gia Content BĐS thực chiến. Hãy viết 02 nội dung khác nhau dựa trên dữ liệu người dùng cung cấp.
Yêu cầu bắt buộc cho 2 nội dung:
Nội dung A (Number-Hook): Câu đầu tiên phải bắt đầu bằng con số (Giá, Diện tích, hoặc Lợi nhuận) và viết HOA toàn bộ.
Nội dung B (Word-Hook): Câu đầu tiên phải là từ ngữ khơi gợi cảm xúc/tình trạng theo đúng Phong cách đã chọn.

Quy tắc theo Phong cách:
Gây Shock: Dùng từ mạnh (Vỡ nợ, Thở oxy, Cắt lỗ, Duy nhất).
Chuyên nghiệp: Tập trung vào giá trị tiềm năng, quy hoạch, pháp lý sổ sách.
Kể chuyện: Dẫn dắt gần gũi (Ví dụ: 'Sáng nay chủ nhà gọi điện nhờ em...', 'Biết bao nhiêu tâm huyết gửi vào căn nhà này...').

Quy tắc theo Vị trí đăng:
FB Quảng cáo: Giật tít mạnh, nhiều Emoji, có Hashtag.
Zalo cá nhân: Ngắn gọn, chân thực, xuống dòng nhiều.
Tin rao BĐS: Đầy đủ, mạch lạc, chuyên nghiệp.

OUTPUT FORMAT (JSON): { "content_a": "...", "content_b": "..." }`;

    const userContext = `
Dữ liệu BĐS:
- Loại hình: ${data.type}
- Vị trí: ${data.location}
- Diện tích: ${data.area}
- Giá: ${data.price}
- Pháp lý: ${data.legal}
- Mục đích: ${data.purpose}
- Vị trí đăng: ${data.channel}
- Phong cách: ${data.style}
${data.phone ? `- Thông tin liên hệ: ${data.name || ''} - ${data.phone}` : ''}
`;

    const fullPrompt = `${basePrompt}\n\n${userContext}\n\nHãy chèn Thông tin liên hệ vào cuối mỗi bài viết. TRẢ VỀ JSON DUY NHẤT.`;

    try {
        const result = await geminiGenerate({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            let text = result.candidates[0].content.parts[0].text;

            // Log raw text for debugging if needed (will show in console)
            console.log('[AI Content] Raw Response:', text);

            try {
                // 1. Try to extract JSON from markdown if AI failed to respect responseMimeType
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const jsonToParse = jsonMatch ? jsonMatch[0] : text;

                const parsed = JSON.parse(jsonToParse);

                // 2. Normalize keys (handle content_a, Content_A, nộidung_a, etc.)
                const normalized: any = {};
                Object.keys(parsed).forEach(key => {
                    const lowKey = key.toLowerCase();
                    if (lowKey.includes('a')) normalized.content_a = parsed[key];
                    if (lowKey.includes('b')) normalized.content_b = parsed[key];
                });

                // 3. Final validation
                return {
                    content_a: normalized.content_a || (parsed.content_a || "Không thể tạo nội dung A"),
                    content_b: normalized.content_b || (parsed.content_b || "Không thể tạo nội dung B")
                };
            } catch (e) {
                console.error('JSON Parse Error, using splitting fallback:', e);
                // Fallback: If it's not JSON, just split the text in half or by newlines
                const lines = text.split('\n\n');
                if (lines.length >= 2) {
                    return {
                        content_a: lines.slice(0, Math.floor(lines.length / 2)).join('\n\n'),
                        content_b: lines.slice(Math.floor(lines.length / 2)).join('\n\n')
                    };
                }
                return {
                    content_a: text.substring(0, Math.floor(text.length / 2)),
                    content_b: text.substring(Math.floor(text.length / 2))
                };
            }
        }

        if (result.candidates?.[0]?.finishReason === 'SAFETY') {
            return {
                content_a: "Nội dung bị chặn bởi bộ lọc an toàn của AI. Vui lòng thử lại với từ ngữ khác.",
                content_b: "Nội dung bị chặn bởi bộ lọc an toàn của AI. Vui lòng thử lại với từ ngữ khác."
            };
        }

        console.warn('[AI Content] No content in candidates:', result);
    } catch (err) {
        console.error('Pro Content AI Fatal Error:', err);
    }
    return null;
}

export async function analyzeImageWithGemini(base64Image: string, customPrompt?: string): Promise<string | null> {


    // Clean base64 header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    const baseVisionPrompt = customPrompt || await getAppSetting('ai_vision_prompt') || `Bạn là CHUYÊN GIA MARKETING BẤT ĐỘNG SẢN. Nhiệm vụ: Nhìn bức ảnh này và viết mô tả chi tiết để AI chỉnh sửa ảnh sao cho KHÁCH HÀNG MUỐN MUA.

BƯỚC 1 — PHÂN LOẠI (xác định bối cảnh):
A) ĐẤT NỀN TRỐNG / PHÂN LÔ: Đất đã cắm cọc, có ranh giới, nhưng chưa xây dựng. B) NHÀ THÔ / XÂY DANG DỞ: Có khung sườn nhưng chưa hoàn thiện. C) CĂN HỘ / PHÒNG CŨ: Nội thất cũ kỹ, tối tăm, hoặc phòng trống. D) NHÀ ĐÃ HOÀN THIỆN: Cần tăng tính hấp dẫn. E) KHÁC: Mô tả ngắn.

BƯỚC 2 — XÁC ĐỊNH "NỖI ĐAU MARKETING":
- Đất nền: "Hoang vu, thiếu hạ tầng". - Nhà thô: "Bỏ hoang, chưa hoàn thiện". - Phòng cũ: "Tối, trống, lỗi thời". - Nhà hoàn thiện: "Sân nhếch nhác".

BƯỚC 3 — MÔ TẢ CẤU TRÚC HÌNH HỌC (Geometry):
- Mô tả kỹ: Góc chụp, đường đi, vị trí đất/nhà, đường chân trời. Ví dụ: "Chụp ngang tầm mắt. Một con đường trải nhựa ở giữa chạy xa dần. Các lô đất trống bằng phẳng ở hai bên. Bầu trời xanh chiếm 40% phía trên."

BƯỚC 4 — VIẾT YÊU CẦU CHỈNH SỬA (tiếng Việt) theo từng scenario:
🏗️ NẾU LÀ ĐẤT NỀN: Giữ ranh giới, thêm cỏ xanh, đường nhựa, đèn đường.
🏚️ NẾU LÀ NHÀ THÔ: Hoàn thiện bề mặt sơn, thêm cửa kính, sân vườn.
🛋️ NẾU LÀ CĂN HỘ: Thêm nội thất hiện đại, tăng ánh sáng.
🏡 NẾU LÀ NHÀ HOÀN THIỆN: Cải thiện cảnh quan, ánh sáng đẹp.

QUY TẮC CHUNG: Ảnh phải trông như CHỤP THẬT (DSLR), cực kỳ sắc nét, sống động.

OUTPUT FORMAT: Bạn BẮT BUỘC chỉ được trả về một chuỗi JSON chuẩn có cấu trúc:
{
  "geometry": "[Mô tả cấu trúc hình học ở Bước 3]",
  "fixPrompt": "[Yêu cầu chỉnh sửa chi tiết ở Bước 4]"
}`;

    const visionPrompt = baseVisionPrompt;

    try {
        const startTime = Date.now();
        const data = await geminiGenerate({
            contents: [{
                parts: [
                    { text: visionPrompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: cleanBase64
                        }
                    }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Log token usage
        if (data.usageMetadata) {
            console.log('[AI] Token Usage (Analyze):', data.usageMetadata);
        }

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            try {
                // Ensure valid json
                const rawText = data.candidates[0].content.parts[0].text;
                JSON.parse(rawText);
                return rawText;
            } catch (e) {
                console.error('Gemini Vision JSON Parse Error:', e, 'RawText:', data.candidates[0].content.parts[0].text);
                return null;
            }
        } else {
            console.error('Gemini Vision Error:', data);
            return null;
        }

    } catch (error) {
        console.error('Gemini Vision Fetch Error:', error);
        return null;
    }
}

export async function extractLeadFromImage(base64Image: string): Promise<{ name: string, phone: string } | null> {

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    const prompt = `Bạn là trợ lý AI chuyên nghiệp cho môi giới BĐS. Hãy nhìn vào ảnh chụp màn hình (Zalo, Messenger, Danh bạ) này và trích xuất:
1. TÊN KHÁCH HÀNG (Name): Tìm tên người dùng, thường xuất hiện ở phần Header hoặc tên trong danh bạ. Ưu tiên tên riêng, không lấy các từ chung chung như "Khách", "Anh", "Chị" nếu có tên cụ thể hơn.
2. SỐ ĐIỆN THOẠI (Phone): Tìm dãy số có định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0 hoặc +84).

QUY TẮC:
- Chỉ trả về JSON chuẩn: { "name": "...", "phone": "..." }
- Nếu không thấy, hãy để chuỗi rỗng "".
- Tuyệt đối không giải thích gì thêm.`;

    try {
        const startTime = Date.now();
        const data = await geminiGenerate({
            model: 'gemini-1.5-flash',
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: cleanBase64
                        }
                    }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            try {
                return JSON.parse(data.candidates[0].content.parts[0].text);
            } catch (e) {
                console.error('Failed to parse lead extraction JSON:', e);
                return null;
            }
        }
    } catch (err) {
        console.error('extractLeadFromImage failed:', err);
    }
    return null;
}

/**
 * Phase 2: Image-to-Image Enhancement
 * Sends original image + fix prompt to Gemini Flash for editing while preserving structure.
 * Falls back to Imagen 4 text-to-image with GEOMETRY constraint.
 */
export async function enhanceImageWithAI(
    base64Image: string,
    fixPrompt: string, // This may now contain "GEOMETRY: ... FIX_PROMPT: ..." or just fix prompt
    aspectRatio: '1:1' | '16:9' | '3:4' | '4:3' = '1:1',
    onStatusUpdate?: (status: string) => void
): Promise<string | null> {
    const hasCreditsForEnhance = true; // Keys are now proxied server-side

    // Credit Check (Cost: 5)
    console.log(`[AI Enhance] Checking credits for user...`);
    const hasCredits = await checkAndDeductCredits(5, 'Enhance Image');
    if (!hasCredits) {
        console.warn(`[AI Enhance] ❌ Insufficient credits or RPC failure.`);
        onStatusUpdate?.('❌ Không đủ Credits (Cần 5). Vui lòng nạp thêm.');
        return null;
    }

    // Robustly extract MIME type and clean Base64 data
    const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
        console.error("[AI Enhance] ❌ Invalid image format.");
        return null;
    }
    const detectedMimeType = match[1];
    const cleanBase64 = match[2];

    // Parse geometry if available
    let geometry = "";
    let actualFixPrompt = fixPrompt;

    try {
        const parsed = JSON.parse(fixPrompt);
        geometry = parsed.geometry || "";
        actualFixPrompt = parsed.fixPrompt || fixPrompt;
    } catch (e) {
        if (fixPrompt.includes("GEOMETRY:") && fixPrompt.includes("FIX_PROMPT:")) {
            const parts = fixPrompt.split("FIX_PROMPT:");
            geometry = parts[0].replace("GEOMETRY:", "").trim();
            actualFixPrompt = parts[1].trim();
        }
    }

    // Phase 2: Marketing-aware enhancement with photorealism emphasis
    const baseEditPrompt = await getAppSetting('ai_edit_prompt') || `Sếp là một biên tập viên ảnh bất động sản chuyên nghiệp. Hãy chỉnh sửa bức ảnh này dựa trên những yêu cầu sau: "{actualFixPrompt}".

    QUAN TRỌNG: Kết quả PHẢI trông như một bức ẢNH CHỤP THẬT bằng máy ảnh chuyên nghiệp, KHÔNG được giống tranh vẽ hay ảnh do AI tạo ra.
    
    QUY TẮC:
    1. GIỮ NGUYÊN ranh giới lô đất, vỉa hè, đường xá và cấu trúc các công trình hiện có trong ảnh.
    2. Thực hiện chính xác các yêu cầu chỉnh sửa.
    3. ĐẢM BẢO ĐỘ THẬT: Sử dụng vân nhám tự nhiên, độ sâu trường ảnh thực tế.
    4. ÁNH SÁNG: Ánh sáng ban ngày trong vắt hoặc nắng vàng nhẹ.
    5. Tuyệt đối TRÁNH: Tránh nhìn như render 3D, tránh nhìn như nhựa, hoạt hình hay tranh vẽ.

Yêu cầu kỹ thuật:
Trả về bản mô tả chi tiết bằng tiếng Việt để bộ máy tạo ảnh hiểu rõ nhất. Chỉ trả về kết quả, không giải thích gì thêm.`;

    const editInstruction = baseEditPrompt.replace('{actualFixPrompt}', actualFixPrompt);

    // Strategy: Retry 3 times with Gemini Flash 3.1 (img2img)
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        attempt++;
        onStatusUpdate?.(attempt === 1 ? '🎨 Đang thiết kế lại không gian...' : `⚠️ Đang thử lại (Lần ${attempt})...`);

        try {
            const gStartTime = Date.now();
            console.log(`[AI Enhance] Trying Gemini 3.1 Flash image editing (img2img) - Attempt ${attempt}/${maxRetries}...`);

            // Use the requested model: gemini-3.1-flash-image-preview
            const modelId = 'gemini-3.1-flash-image-preview';
            const ratioDesc = aspectRatio === '1:1' ? 'khung hình vuông 1:1' : (aspectRatio === '16:9' ? 'khung hình rộng 16:9' : `tỉ lệ ${aspectRatio}`);
            const finalInstruction = `${editInstruction}. Yêu cầu xuất ảnh theo ${ratioDesc}.`;

            const response_data = await geminiGenerate({
                model: modelId,
                contents: [{
                    parts: [
                        { text: finalInstruction },
                        {
                            inlineData: {
                                mimeType: detectedMimeType,
                                data: cleanBase64
                            }
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"]
                }
            });

            const data = response_data;

            if (data.usageMetadata) {
                console.log('[AI] Token Usage:', data.usageMetadata);
            }

            if (data.candidates?.[0]?.content?.parts) {
                const parts = data.candidates[0].content.parts;
                const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('image/'));

                if (imagePart) {
                    console.log('[AI Enhance] ✅ Gemini 3.1 Flash successful!');
                    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                }
            }

            const errorMsg = data.error?.message || 'Lỗi không xác định';
            const errorCode = data.error?.code || 500;
            console.error(`[AI Enhance] ❌ Attempt ${attempt} FAILED | Status: ${errorCode} | Message: ${errorMsg}`);

            // Show specific error to user for debugging
            onStatusUpdate?.(`❌ Lỗi API (${errorCode}): ${errorMsg}`);

            if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
            console.error(`[AI Enhance] ❌ Attempt ${attempt} EXCEPTION:`, error);
            onStatusUpdate?.(`❌ Lỗi mạng/Hệ thống: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    onStatusUpdate?.('❌ Không thể hoàn thành nâng cấp sau 3 lần thử.');
    return null;
}

export async function generateImageWithAI(prompt: string, aspectRatio: '1:1' | '16:9' = '1:1'): Promise<string | null> {
    const startTime = Date.now();

    // Credit Check (Cost: 5)
    const hasCredits = await checkAndDeductCredits(5, 'Generate Image');
    if (!hasCredits) {
        throw new Error('Bạn không đủ Credits để thực hiện tính năng này (Cần 5).');
    }

    const ratioText = aspectRatio === '16:9' ? 'khung hình rộng 16:9 cinematic display' : 'khung hình vuông 1:1';
    const baseGenPrompt = await getAppSetting('ai_image_gen_prompt') || `Ảnh chụp bất động sản cao cấp, ${ratioText}: {prompt}, cực kỳ chân thực, độ phân giải 8k, ánh sáng kiến trúc, sắc nét, bố cục sạch sẽ, TUYỆT ĐỐI KHÔNG có chữ, không nhãn dán, không logo, không hình mờ`;
    const enhancedPrompt = baseGenPrompt.replace('{prompt}', prompt);

    // Key is now managed server-side via proxy

    const modelId = 'gemini-3.1-flash-image-preview';
    const imagenPrompt = aspectRatio === '16:9' ? `${enhancedPrompt}. Cinematic wide shot 16:9 aspect ratio.` : enhancedPrompt;

    try {
        const gStartTime = Date.now();
        console.log(`[AI] Generating image with ${modelId}...`);

        const data = await geminiGenerate({
            model: modelId,
            contents: [{ parts: [{ text: imagenPrompt }] }],
            generationConfig: {
                responseModalities: ["IMAGE"]
            }
        });

        if (data.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    console.log('[AI] ✅ Gemini 3.1 Flash generated image successfully!');
                    return `data:${mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        const errorMsg = data.error?.message || 'Unknown API Error';
        console.error(`[AI] ${modelId} Error:`, errorMsg);
        throw new Error(errorMsg);

    } catch (err) {
        console.error('[AI] Gemini 3.1 Flash Generate Error:', err);
        throw err;
    }
}

