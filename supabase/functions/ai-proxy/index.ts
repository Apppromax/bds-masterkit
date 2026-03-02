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
            'generateContent': 2,    // Content Creator / General AI
            'openaiChat': 2,         // OpenAI Text
            'fengShuiConsult': 5,    // Feng Shui
            'generateImage': 1       // Image Studio
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
                error: `Không đủ Xu. Bạn cần ít nhất ${actionCost} Xu để thực hiện.`,
                insufficient: true
            }), {
                status: 402,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        let result: any = null
        let model = payload.model || 'gemini-2.0-flash'
        let provider = 'gemini'
        let tokens = 0
        let estimatedMoneyCost = 0
        const serverStartTime = Date.now()

        // Money cost calculation for logs
        const getMoneyCost = (m: string, inputTokens: number, outputTokens: number) => {
            const low = m.toLowerCase()
            if (low.includes('1.5-pro')) return (inputTokens * 0.0035 + outputTokens * 0.0105) / 1000
            if (low.includes('flash-8b')) return (inputTokens * 0.0000375 + outputTokens * 0.00015) / 1000
            if (low.includes('1.5-flash')) return (inputTokens * 0.000075 + outputTokens * 0.0003) / 1000
            if (low.includes('2.0-flash')) return (inputTokens * 0.0001 + outputTokens * 0.0004) / 1000
            return (inputTokens * 0.0001 + outputTokens * 0.0004) / 1000
        }

        switch (actionType) {
            case 'generateContent': {
                const apiStart = Date.now()
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': GEMINI_KEY,
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

                // SECURE DEDUCTION
                if (response.status === 200 && !isUserAdmin) {
                    await supabaseClient.rpc('deduct_credits_secure', {
                        p_cost: actionCost,
                        p_action: `AI: ${model} (${actionType})`
                    })
                }

                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'gemini',
                    model,
                    endpoint: 'generateContent',
                    status_code: response.status,
                    duration_ms: durationMs,
                    prompt_preview: JSON.stringify(payload.contents).substring(0, 500),
                    token_count: tokens,
                    estimated_cost: estimatedMoneyCost
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

                // SECURE DEDUCTION
                if (response.status === 200 && !isUserAdmin) {
                    await supabaseClient.rpc('deduct_credits_secure', {
                        p_cost: actionCost,
                        p_action: `OpenAI: ${model}`
                    })
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
