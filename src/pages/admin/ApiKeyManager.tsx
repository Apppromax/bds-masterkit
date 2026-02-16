import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Key, Trash2, Edit2, Play, Pause, Plus, RefreshCw, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface ApiKey {
    id: string;
    provider: string;
    key_value: string;
    name: string;
    is_active: boolean;
    usage_count: number;
    error_count: number;
    tier: 'free' | 'pro';
    created_at: string;
}

export default function ApiKeyManager() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        provider: 'gemini',
        key_value: '',
        name: '',
        tier: 'free'
    });

    const loadKeys = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setKeys(data as ApiKey[]);
        if (error) console.error('Error loading keys:', error);
        setLoading(false);
    };

    useEffect(() => {
        loadKeys();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('api_keys').insert([formData]);
        if (!error) {
            setFormData({ provider: 'gemini', key_value: '', name: '', tier: 'free' });
            loadKeys();
        } else {
            alert('Lỗi: ' + error.message);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await supabase.from('api_keys').update({ is_active: !currentStatus }).eq('id', id);
        setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
    };

    const deleteKey = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa key này?')) return;
        await supabase.from('api_keys').delete().eq('id', id);
        setKeys(keys.filter(k => k.id !== id));
    };

    // Helper to mask key
    const maskKey = (key: string) => {
        if (!key) return '***';
        return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3">
                    <Key size={20} className="text-blue-600" /> Quản lý API Key Pool
                </h2>
                <div className="flex gap-2">
                    <button onClick={loadKeys} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Add */}
                <div className="lg:col-span-1 space-y-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Thêm Key Mới</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">Nhà cung cấp</label>
                            <select
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold"
                                value={formData.provider}
                                onChange={e => setFormData({ ...formData, provider: e.target.value })}
                            >
                                <option value="gemini">Google Gemini (Imagen 3)</option>
                                <option value="openai">OpenAI (DALL-E 3)</option>
                                <option value="stability">Stability AI (SDXL)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Tên gợi nhớ</label>
                            <input
                                type="text"
                                placeholder="VD: Gemini Free Pool 1"
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">API Key</label>
                            <input
                                type="text"
                                placeholder="sk-..."
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono"
                                value={formData.key_value}
                                onChange={e => setFormData({ ...formData, key_value: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Phân loại Tier</label>
                            <select
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold"
                                value={formData.tier}
                                onChange={e => setFormData({ ...formData, tier: e.target.value as 'free' | 'pro' })}
                            >
                                <option value="free">Free Tier (Ưu tiên thấp)</option>
                                <option value="pro">Paid Tier (Ưu tiên cao)</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                            <Plus size={18} /> Thêm vào Pool
                        </button>
                    </form>
                </div>

                {/* List Keys */}
                <div className="lg:col-span-2 space-y-4">
                    {keys.length === 0 ? (
                        <div className="text-center p-10 text-slate-400">Chưa có key nào trong Pool.</div>
                    ) : (
                        <div className="grid gap-3">
                            {keys.map(key => (
                                <div key={key.id} className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${key.is_active ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 opacity-60'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${key.provider === 'gemini' ? 'bg-blue-100 text-blue-600' :
                                                key.provider === 'openai' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                            }`}>
                                            <Zap size={20} fill="currentColor" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{key.name}</h4>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${key.tier === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>{key.tier}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">{maskKey(key.key_value)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Usage</p>
                                            <p className="font-mono text-sm font-bold">{key.usage_count}</p>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Errors</p>
                                            <p className={`font-mono text-sm font-bold ${key.error_count > 0 ? 'text-red-500' : 'text-slate-900'}`}>{key.error_count}</p>
                                        </div>

                                        <div className="flex items-center gap-2 pl-4 border-l border-slate-100 dark:border-slate-800">
                                            <button
                                                onClick={() => toggleStatus(key.id, key.is_active)}
                                                className={`p-2 rounded-lg transition-all ${key.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                    }`}
                                                title={key.is_active ? "Đang hoạt động (Click để tắt)" : "Đã tắt (Click để bật)"}
                                            >
                                                {key.is_active ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                            </button>
                                            <button
                                                onClick={() => deleteKey(key.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
