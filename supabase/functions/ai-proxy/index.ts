import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')!
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')!

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Verify user is authenticated via Supabase JWT
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing auth header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Parse request body
        const { action, payload } = await req.json()
        const actionType = action || 'unknown'

        // Define fixed costs based on action (Hardened Server-side)
        const COST_MAP: any = {
            'generateContent': 1,    // Content Creator / General AI
            'openaiChat': 1,         // OpenAI Text
            'fengShuiConsult': 2,    // Feng Shui
            'generateImage': 10      // Image Studio (Base)
        }

        const actionCost = COST_MAP[actionType] || 1

        // 1. PRE-CHECK: Fetch current credits
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('credits, role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return new Response(JSON.stringify({ error: 'Failed to verify credits' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const isUserAdmin = profile.role === 'admin'
        if (profile.credits < actionCost && !isUserAdmin) {
            return new Response(JSON.stringify({
                error: `Không đủ Xu. Bạn cần ít nhất ${actionCost} Xu để thực hiện. (Hiện có: ${profile.credits} Xu)`,
                insufficient: true
            }), {
                status: 402,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        let result: any = null
        // AUTO-UPDATE: gemini-2.0-flash is now legacy, using 2.5-flash for 2026 projects
        let model = payload.model || (actionType === 'generateContent' ? 'gemini-2.5-flash' : (payload.model || 'gpt-4o-mini'))
        let provider = actionType === 'openaiChat' ? 'openai' : 'gemini'
        let tokens = 0
        let estimatedMoneyCost = 0
        const serverStartTime = Date.now()

        // SECURE KEY RETRIEVAL: Try DB first (rotation/pool), fallback to ENV
        let effectiveKey = (provider === 'openai') ? OPENAI_KEY : GEMINI_KEY

        if (!effectiveKey || effectiveKey.includes('REPLACE')) {
            const { data: dbKey } = await supabaseClient.rpc('get_best_api_key', { p_provider: provider })
            if (dbKey) {
                effectiveKey = dbKey
            }
        }

        if (!effectiveKey) {
            return new Response(JSON.stringify({ error: `Hệ thống chưa cấu hình ${provider} API Key.` }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Load model pricing from DB (dynamic, admin-configurable)
        let pricingMap: Record<string, { inputPrice: number; outputPrice: number }> = {}
        try {
            const { data: pricingRow } = await supabaseClient
                .from('app_settings')
                .select('value')
                .eq('key', 'model_pricing')
                .single()

            if (pricingRow?.value) {
                const parsed = JSON.parse(pricingRow.value)
                if (Array.isArray(parsed)) {
                    for (const p of parsed) {
                        pricingMap[p.id] = {
                            inputPrice: parseFloat(p.inputPrice) || 0,
                            outputPrice: parseFloat(p.outputPrice) || 0
                        }
                    }
                }
            }
        } catch (_) {
            // Fallback: use defaults if DB read fails
        }

        // Money cost calculation using DB pricing ($ per 1M tokens)
        const getMoneyCost = (m: string, inputTokens: number, outputTokens: number) => {
            const low = m.toLowerCase()
            if (pricingMap[m]) {
                return (inputTokens * pricingMap[m].inputPrice + outputTokens * pricingMap[m].outputPrice) / 1_000_000
            }
            for (const [key, price] of Object.entries(pricingMap)) {
                if (low.includes(key) || key.includes(low)) {
                    return (inputTokens * price.inputPrice + outputTokens * price.outputPrice) / 1_000_000
                }
            }
            return (inputTokens * 0.10 + outputTokens * 0.40) / 1_000_000
        }

        switch (actionType) {
            case 'generateContent': {
                const actionTag = payload.actionTag || null
                const logEndpoint = actionTag || 'generateContent'

                const apiStart = Date.now()
                const apiVersion = model.includes('2.5') ? 'v1beta' : 'v1'
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': effectiveKey,
                        },
                        body: JSON.stringify({
                            contents: payload.contents,
                            generationConfig: payload.generationConfig,
                        }),
                    }
                )
                const durationMs = Date.now() - apiStart
                result = await response.json()

                if (result.usageMetadata) {
                    const input = result.usageMetadata.promptTokenCount || 0
                    const output = result.usageMetadata.candidatesTokenCount || 0
                    tokens = result.usageMetadata.totalTokenCount || (input + output)
                    estimatedMoneyCost = getMoneyCost(model, input, output)
                }

                if (response.status === 200 && !isUserAdmin) {
                    let shouldDeduct = true
                    if (actionTag === 'sales_strategy') {
                        const todayStart = new Date()
                        todayStart.setHours(0, 0, 0, 0)
                        const { count } = await supabaseClient
                            .from('api_logs')
                            .select('*', { count: 'exact', head: true })
                            .eq('user_id', user.id)
                            .eq('endpoint', 'sales_strategy')
                            .gte('created_at', todayStart.toISOString())
                        if ((count || 0) < 5) shouldDeduct = false
                    }
                    if (shouldDeduct) {
                        // Frontend performs exact point deduction (combos, flycam, etc.)
                        // Server relies on preflight check (profile.credits < actionCost)
                    }
                }

                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'gemini',
                    model,
                    endpoint: logEndpoint,
                    status_code: response.status,
                    duration_ms: durationMs,
                    prompt_preview: JSON.stringify(payload.contents).substring(0, 500),
                    token_count: tokens,
                    estimated_cost: estimatedMoneyCost
                }).then(() => { })

                break
            }

            case 'generateImage': {
                const apiStart = Date.now()
                const imageModel = payload.model || 'imagen-4.0-generate-001'
                const isGemini = imageModel.startsWith('gemini');
                const endpoint = isGemini ? 'generateContent' : 'predict';
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:${endpoint}`;

                let requestBody: any;
                if (isGemini) {
                    // For Gemini models, we append aspect ratio to the prompt as it doesn't support a dedicated parameter in generateContent
                    const ratioInstruction = payload.aspectRatio ? `\n\nREQUIRED OUTPUT ASPECT RATIO: ${payload.aspectRatio}.` : "";
                    const parts: any[] = [{ text: payload.prompt + ratioInstruction }];
                    if (payload.baseImage) {
                        parts.push({
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: payload.baseImage
                            }
                        });
                    }
                    requestBody = { contents: [{ parts }] };
                } else {
                    requestBody = {
                        instances: [
                            payload.baseImage
                                ? { prompt: payload.prompt, image: { bytesBase64Encoded: payload.baseImage } }
                                : { prompt: payload.prompt }
                        ],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: payload.aspectRatio || "1:1"
                        }
                    };
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': effectiveKey,
                    },
                    body: JSON.stringify(requestBody),
                });

                const durationMs = Date.now() - apiStart
                let rawResult = await response.json()

                // Normalize result so the client code doesn't break
                result = rawResult;
                if (isGemini && response.status === 200) {
                    const candidateParts = rawResult.candidates?.[0]?.content?.parts || [];
                    const inlineDataPart = candidateParts.find((p: any) => p.inlineData);
                    if (inlineDataPart) {
                        result = {
                            predictions: [
                                { bytesBase64Encoded: inlineDataPart.inlineData.data }
                            ]
                        };
                    } else if (candidateParts.length > 0 && candidateParts[0].text) {
                        // The model generated text instead of an image
                        result = { error: { message: "AI returned text instead of an image: " + candidateParts[0].text.substring(0, 100), code: 500 } };
                    }
                }

                // Frontend calculates precise combos like flycam + variants and deducts securely via RPC.
                // We just do pre-flight balance bounds checking at the top.
                if (response.status === 200 && !result.error && !isUserAdmin) {
                    // Skipped server-side deduction due to double-billing issue
                }

                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'gemini',
                    model: imageModel,
                    endpoint: 'imagen/generate',
                    status_code: response.status,
                    duration_ms: durationMs,
                    prompt_preview: payload.prompt.substring(0, 500),
                    token_count: 0,
                    estimated_cost: 0.10 // Approx fixed cost for image gen
                }).then(() => { })

                break
            }

            case 'openaiChat': {
                provider = 'openai'
                const apiStart = Date.now()
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_KEY}`,
                    },
                    body: JSON.stringify({
                        model: payload.model || 'gpt-3.5-turbo',
                        messages: payload.messages,
                        temperature: payload.temperature ?? 0.8,
                    }),
                })
                const durationMs = Date.now() - apiStart
                result = await response.json()

                if (result.usage) {
                    const input = result.usage.prompt_tokens || 0
                    const output = result.usage.completion_tokens || 0
                    tokens = result.usage.total_tokens || (input + output)
                    estimatedMoneyCost = (input * 0.0005 + output * 0.0015) / 1000
                }

                // SECURE DEDUCTION (Deferred to frontend for now to prevent double billing)
                if (response.status === 200 && !isUserAdmin) {
                    // Frontend handles it
                }

                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'openai',
                    model: payload.model || 'gpt-3.5-turbo',
                    endpoint: 'chat/completions',
                    status_code: response.status,
                    duration_ms: durationMs,
                    prompt_preview: JSON.stringify(payload.messages).substring(0, 500),
                    token_count: tokens,
                    estimated_cost: estimatedMoneyCost
                }).then(() => { })

                break
            }

            default:
                return new Response(JSON.stringify({ error: `Unknown action: ${actionType}` }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
