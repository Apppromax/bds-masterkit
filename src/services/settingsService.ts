import { supabase } from '../lib/supabaseClient';

export async function getAppSetting(key: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) return null;
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

        return !error;
    } catch (err) {
        return false;
    }
}
