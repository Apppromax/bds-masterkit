
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CreditCard, Activity, Key, Save, Lock } from 'lucide-react';

export default function AdminDashboard() {
    const { profile } = useAuth();
    const [apiKeys, setApiKeys] = useState({
        openai: '',
        stability: '',
        replicate: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveKeys = async () => {
        setIsSaving(true);
        // Simulate saving to Supabase app_settings table
        console.log("Saving keys:", apiKeys);

        // In a real app with Supabase:
        // await supabase.from('app_settings').upsert([
        //   { key: 'openai_api_key', value: apiKeys.openai },
        //   { key: 'stability_api_key', value: apiKeys.stability }
        // ]);

        setTimeout(() => {
            alert("Đã lưu API Keys thành công!");
            setIsSaving(false);
        }, 1000);
    };

    return (
        <div className="p-6 pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Xin chào, {profile?.full_name} ({profile?.role})
                </p>
            </div>

            {/* API Key Management Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Key size={20} className="text-blue-600" /> Quản lý API Key
                    </h2>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <Lock size={12} /> Secure Storage
                    </span>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500 mb-4">
                        Cấu hình các key này để kích hoạt tính năng AI (Tạo ảnh, Chatbot) cho người dùng.
                        Key được lưu bảo mật và chỉ Admin thấy.
                    </p>

                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">OpenAI API Key (ChatGPT)</label>
                            <input
                                type="password"
                                placeholder="sk-..."
                                value={apiKeys.openai}
                                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stability AI Key (Tạo ảnh BĐS)</label>
                            <input
                                type="password"
                                placeholder="sk-..."
                                value={apiKeys.stability}
                                onChange={(e) => setApiKeys({ ...apiKeys, stability: e.target.value })}
                                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                        <button
                            onClick={handleSaveKeys}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                        >
                            <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng User</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Doanh thu tháng</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">45.2M</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Giao dịch chờ duyệt</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Placeholder */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Giao dịch gần đây</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</button>
                </div>
                <div className="p-6 text-center text-slate-500">
                    Chưa có dữ liệu thực tế
                </div>
            </div>
        </div>
    );
}

