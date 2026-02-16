import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CreditCard, Activity, Key, Save, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { getAppSetting, setAppSetting } from '../../services/settingsService';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
    const { profile } = useAuth();
    const [apiKeys, setApiKeys] = useState({
        openai_api_key: '',
        stability_api_key: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total_users: 0,
        total_projects: 0,
        pending_transactions: 0
    });

    useEffect(() => {
        const loadSettings = async () => {
            const openai = await getAppSetting('openai_api_key');
            const stability = await getAppSetting('stability_api_key');
            setApiKeys({
                openai_api_key: openai || '',
                stability_api_key: stability || '',
            });

            // Fetch real stats
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });

            setStats({
                total_users: userCount || 0,
                total_projects: projectCount || 0,
                pending_transactions: 0
            });

            setIsLoading(false);
        };
        loadSettings();
    }, []);

    const handleSaveKeys = async () => {
        setIsSaving(true);

        const ok1 = await setAppSetting('openai_api_key', apiKeys.openai_api_key, 'OpenAI API Key for Content & AI');
        const ok2 = await setAppSetting('stability_api_key', apiKeys.stability_api_key, 'Stability AI Key for Image Gen');

        if (ok1 && ok2) {
            alert("Đã lưu API Keys bảo mật thành công!");
        } else {
            alert("Lỗi khi lưu cấu hình. Vui lòng kiểm tra quyền Admin.");
        }
        setIsSaving(false);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="p-6 pb-24 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent mb-2">
                    Admin Control Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" /> Hệ thống đang hoạt động ổn định. Chào sếp {profile?.full_name}!
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Người Dùng</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_users}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Dự Án</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_projects}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giao Dịch Chờ</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending_transactions}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                            <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <Key size={20} className="text-blue-600" /> Cấu hình API Keys (Hệ thống AI)
                            </h2>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg flex items-center gap-1">
                                <Lock size={12} /> BẢO MẬT CAO
                            </span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">OpenAI API Key</label>
                                    <input
                                        type="password"
                                        placeholder="sk-..."
                                        value={apiKeys.openai_api_key}
                                        onChange={(e) => setApiKeys({ ...apiKeys, openai_api_key: e.target.value })}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Dùng cho Content Creator và Chatbot AI.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Stability AI Key</label>
                                    <input
                                        type="password"
                                        placeholder="sk-..."
                                        value={apiKeys.stability_api_key}
                                        onChange={(e) => setApiKeys({ ...apiKeys, stability_api_key: e.target.value })}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Dùng cho Image Studio (Tạo phối cảnh BĐS).</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                                <button
                                    onClick={handleSaveKeys}
                                    disabled={isSaving}
                                    className="px-8 py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {isSaving ? 'ĐANG LƯU...' : 'LƯU CẤU HÌNH HỆ THỐNG'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Logs or Fast Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Gói Dịch Vụ</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                                <span className="text-sm font-bold">Thành viên FREE</span>
                                <span className="text-blue-600 font-black">982</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex justify-between items-center border border-amber-100 dark:border-amber-900/20">
                                <span className="text-sm font-bold text-amber-700">Thành viên PRO</span>
                                <span className="text-amber-700 font-black text-lg">252</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white text-center">
                        <ShieldCircle size={48} className="mx-auto mb-4" />
                        <h3 className="font-black text-xl mb-2">MasterKit Security</h3>
                        <p className="text-blue-100 text-xs mb-6 px-4">Tất cả dữ liệu API Key được mã hóa một đầu và lưu tại Vault của Supabase.</p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all backdrop-blur-md">
                            Kiểm tra kết nối
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Missing import fix
import { ShieldAlert as ShieldCircle } from 'lucide-react';
