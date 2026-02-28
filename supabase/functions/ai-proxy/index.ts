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

        switch (action) {
            case 'generateContent': {
                // Text generation with Gemini
                const model = payload.model || 'gemini-2.0-flash'
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

                // Log API usage
                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'gemini',
                    model,
                    endpoint: 'generateContent',
                    status_code: response.status,
                    duration_ms: payload.duration_ms || 0,
                    prompt_preview: JSON.stringify(payload.contents).substring(0, 1000),
                }).then(() => { })

                break
            }

            case 'openaiChat': {
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

                await supabaseClient.from('api_logs').insert({
                    user_id: user.id,
                    provider: 'openai',
                    model: payload.model || 'gpt-3.5-turbo',
                    endpoint: 'chat/completions',
                    status_code: response.status,
                    duration_ms: payload.duration_ms || 0,
                    prompt_preview: JSON.stringify(payload.messages).substring(0, 1000),
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
