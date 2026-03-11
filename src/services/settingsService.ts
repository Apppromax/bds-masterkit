import { supabase } from '../lib/supabaseClient';

const cache = new Map<string, { value: string; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAppSetting(key: string): Promise<string | null> {
    // Check cache first
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
        return cached.value;
    }

    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) return null;

        // Store in cache
        cache.set(key, { value: data.value, expires: Date.now() + CACHE_TTL });
        return data.value;
    } catch (err) {
        return null;
    }
}

export async function setAppSetting(key: string, value: string, description?: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key, value, description, updated_at: new Date().toISOString() });

        if (!error) {
            // Invalidate cache on write
            cache.set(key, { value, expires: Date.now() + CACHE_TTL });
        }

        return !error;
    } catch (err) {
        return false;
    }
}
