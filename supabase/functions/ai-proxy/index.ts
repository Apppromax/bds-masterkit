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

        let result: any = null
        let model = payload.model || 'gemini-2.0-flash'
        let provider = 'gemini'
        let tokens = 0
        let cost = 0

        // Comprehensive Cost estimation per 1K tokens (Market rates 2025)
        const getCost = (m: string, inputTokens: number, outputTokens: number) => {
            const low = m.toLowerCase()

            // Gemini 1.5 Pro: Input: $3.5/1M, Output: $10.5/1M
            if (low.includes('1.5-pro')) return (inputTokens * 0.0035 + outputTokens * 0.0105) / 1000

            // Gemini 1.5 Flash-8B: Input: $0.0375/1M, Output: $0.15/1M
            if (low.includes('flash-8b')) return (inputTokens * 0.0000375 + outputTokens * 0.00015) / 1000

            // Gemini 1.5 Flash: Input: $0.075/1M, Output: $0.3/1M
            if (low.includes('1.5-flash')) return (inputTokens * 0.000075 + outputTokens * 0.0003) / 1000

            // Gemini 2.0 Flash: Input: $0.1/1M, Output: $0.4/1M
            if (low.includes('2.0-flash')) return (inputTokens * 0.0001 + outputTokens * 0.0004) / 1000

            // Gemini 1.0 Pro: Input: $0.5/1M, Output: $1.5/1M
            if (low.includes('pro') && !low.includes('1.5')) return (inputTokens * 0.0005 + outputTokens * 0.0015) / 1000

            // Default Fallback (1.5 Flash)
            return (inputTokens * 0.000075 + outputTokens * 0.0003) / 1000
        }

        switch (action) {
            case 'generateContent': {
                // Gemini API call
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
                result = await response.json()

                if (result.usageMetadata) {
                    const input = result.usageMetadata.promptTokenCount || 0
                    const output = result.usageMetadata.candidatesTokenCount || 0
                    tokens = result.usageMetadata.totalTokenCount || (input + output)
                    cost = getCost(model, input, output)
                }

                // Log API usage (including tokens & cost)
                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'gemini',
                    model,
                    endpoint: 'generateContent',
                    status_code: response.status,
                    duration_ms: payload.duration_ms || 0,
                    prompt_preview: JSON.stringify(payload.contents).substring(0, 1000),
                    token_count: tokens,
                    estimated_cost: cost
                }).then(() => { })

                break
            }

            case 'openaiChat': {
                provider = 'openai'
                // OpenAI Chat Completions
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
                result = await response.json()

                if (result.usage) {
                    const input = result.usage.prompt_tokens || 0
                    const output = result.usage.completion_tokens || 0
                    tokens = result.usage.total_tokens || (input + output)
                    // Simplified OpenAI cost for gpt-3.5-turbo or similar (input: 0.5c/1M, output: 1.5c/1M)
                    cost = (input * 0.0005 + output * 0.0015) / 1000
                }

                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'openai',
                    model: payload.model || 'gpt-3.5-turbo',
                    endpoint: 'chat/completions',
                    status_code: response.status,
                    duration_ms: payload.duration_ms || 0,
                    prompt_preview: JSON.stringify(payload.messages).substring(0, 1000),
                    token_count: tokens,
                    estimated_cost: cost
                }).then(() => { })

                break
            }

            default:
                return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
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
