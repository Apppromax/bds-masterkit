import { supabase } from '../lib/supabaseClient';

const isDev = import.meta.env.DEV;

/**
 * Proxy all AI API calls through Supabase Edge Function.
 * API keys NEVER leave the server — user cannot see/copy them.
 */
async function callAiProxy(action: string, payload: Record<string, any>): Promise<any> {
    const startTime = Date.now();

    const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: { action, payload: { ...payload, duration_ms: Date.now() - startTime } },
    });

    if (error) {
        console.error(`[AI Proxy] Error (${action}):`, error.message);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Call Gemini API via server-side proxy
 */
export async function geminiGenerate(opts: {
    model?: string;
    contents: any[];
    generationConfig?: Record<string, any>;
}): Promise<any> {
    return callAiProxy('generateContent', {
        model: opts.model || 'gemini-2.0-flash',
        contents: opts.contents,
        generationConfig: opts.generationConfig,
    });
}

/**
 * Call OpenAI API via server-side proxy
 */
export async function openaiChat(opts: {
    model?: string;
    messages: any[];
    temperature?: number;
}): Promise<any> {
    return callAiProxy('openaiChat', {
        model: opts.model || 'gpt-3.5-turbo',
        messages: opts.messages,
        temperature: opts.temperature ?? 0.8,
    });
}
