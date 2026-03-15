import { supabase } from '../lib/supabaseClient';
import { getAppSetting } from './settingsService';

const isDev = import.meta.env.DEV;

/**
 * Proxy all AI API calls through Supabase Edge Function.
 */
async function callAiProxy(action: string, payload: Record<string, any>): Promise<any> {
    const startTime = Date.now();

    const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: { action, payload: { ...payload, duration_ms: Date.now() - startTime } },
    });

    if (error) {
        // Handle Insufficient Credits (402) or other server-enforced errors
        console.error(`[AI Proxy] Error (${action}):`, error.message);
        throw new Error(error.message || 'Lỗi hệ thống AI (Proxy)');
    }

    // Edge functions sometimes return 200 with an 'error' field in JSON
    if (data && data.error) {
        if (data.insufficient) {
            throw new Error(data.error);
        }
        throw new Error(`AI API: ${data.error}`);
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
    actionTag?: string;
}): Promise<any> {
    const defaultModel = await getAppSetting('ai_default_model') || 'gemini-2.5-flash';
    return callAiProxy('generateContent', {
        model: opts.model || defaultModel,
        contents: opts.contents,
        generationConfig: opts.generationConfig,
        actionTag: opts.actionTag,
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
/**
 * Call Gemini Image Generation (Imagen) via server-side proxy
 */
export async function geminiGenerateImage(opts: {
    prompt: string;
    model?: string;
    aspectRatio?: '1:1' | '16:9' | '3:4' | '4:3';
    baseImage?: string;
    extraImages?: string[]; // Additional images (base64, no header)
}): Promise<any> {
    return callAiProxy('generateImage', {
        prompt: opts.prompt,
        model: opts.model || 'imagen-4.0-generate-001',
        aspectRatio: opts.aspectRatio || '1:1',
        baseImage: opts.baseImage,
        extraImages: opts.extraImages
    });
}

