import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Settings, Save, Loader2, CheckCircle2, CreditCard, Banknote } from 'lucide-react';

export default function AppSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({
        premium_price: '499.000',
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'HOMESPRO [EMAIL]'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const { data, error } = await supabase.from('app_settings').select('*');
            if (data) {
                const mapped = data.reduce((acc: any, curr: any) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
                setSettings(prev => ({ ...prev, ...mapped }));
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = Object.entries(settings).map(([key, value]) =>
                supabase.from('app_settings').upsert({ key, value })
            );
            await Promise.all(promises);
            setLastSaved(new Date());
        } catch (err) {
            console.error('Save failed:', err);
            alert('Lỗi khi lưu cài đặt');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3">
                    <Settings className="text-blue-600" size={24} /> Cấu hình Thanh toán & Nội dung
                </h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    LƯU CẤU HÌNH
                </button>
            </div>

            {lastSaved && (
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold">
                    <CheckCircle2 size={18} /> Cập nhật thành công lúc {lastSaved.toLocaleTimeString()}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pricing Config */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={14} /> Gói Premium
                    </h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Giá gói / Tháng (VNĐ)</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            value={settings.premium_price}
                            placeholder="499.000"
                            onChange={e => setSettings({ ...settings, premium_price: e.target.value })}
                        />
                    </div>
                </div>

                {/* Bank Information */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Banknote size={14} /> Thông tin Chuyển khoản
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Ngân hàng</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                value={settings.bank_name}
                                placeholder="MB BANK"
                                onChange={e => setSettings({ ...settings, bank_name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Số tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={settings.bank_account}
                                    placeholder="0901234567"
                                    onChange={e => setSettings({ ...settings, bank_account: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Chủ tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    value={settings.bank_owner}
                                    placeholder="NGUYEN VAN A"
                                    onChange={e => setSettings({ ...settings, bank_owner: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Nội dung chuyển khoản mẫu</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                value={settings.payment_note}
                                placeholder="HOMESPRO [EMAIL]"
                                onChange={e => setSettings({ ...settings, payment_note: e.target.value })}
                            />
                            <p className="mt-2 text-[10px] text-slate-400 italic">Gợi ý: Dùng tag [EMAIL] để hệ thống tự thay thế email của khách.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
