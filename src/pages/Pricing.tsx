import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Crown, Check, X, ShieldCheck, Zap, Sparkles, MessageSquare, ImageIcon, Layout, Loader2, ArrowRight, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
    const { profile, user } = useAuth();
    const [settings, setSettings] = useState<Record<string, string>>({
        premium_price: '499.000',
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'HOMESPRO [EMAIL]'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const { data } = await supabase.from('app_settings').select('*');
            if (data) {
                const mapped = data.reduce((acc: any, curr: any) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
                setSettings(prev => ({ ...prev, ...mapped }));
            }
            setIsLoading(false);
        };
        loadSettings();
    }, []);

    const features = [
        { name: 'Image Studio cơ bản', free: true, pro: true, icon: <ImageIcon size={18} /> },
        { name: 'Tạo quảng cáo mẫu', free: true, pro: true, icon: <Layout size={18} /> },
        { name: 'Tra hướng nhà Bát Trạch', free: true, pro: true, icon: <Layout size={18} /> },
        { name: 'AI Image Studio (Premium Templates)', free: false, pro: true, icon: <Sparkles size={18} /> },
        { name: 'Tạo nội dung AI Đa kênh (Facebook, Zalo, TikTok)', free: false, pro: true, icon: <MessageSquare size={18} /> },
        { name: 'Thầy Phong Thủy AI (Tư vấn chuyên sâu)', free: false, pro: true, icon: <Zap size={18} /> },
        { name: 'Không giới hạn lượt dùng AI', free: false, pro: true, icon: <ShieldCheck size={18} /> },
        { name: 'Gỡ bỏ Watermark hệ thống', free: false, pro: true, icon: <X size={18} /> },
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    const qrUrl = `https://img.vietqr.io/image/${settings.bank_name.replace(/\s/g, '')}-${settings.bank_account}-compact.png?amount=${settings.premium_price.replace(/\./g, '')}&addInfo=${encodeURIComponent(settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH'))}&accountName=${encodeURIComponent(settings.bank_owner)}`;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-16">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Nâng cấp trải nghiệm <span className="relative">PRO<div className="absolute -top-6 -right-8"><Crown className="text-amber-500 rotate-12" size={32} fill="currentColor" /></div></span>
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto">Sở hữu bộ công cụ AI tối thượng dành riêng cho nhà môi giới BĐS chuyên nghiệp.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Free Plan */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-10 flex flex-col hover:shadow-xl transition-all h-full">
                    <div className="mb-8">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Gói Cơ Bản</span>
                        <h2 className="text-3xl font-black mt-4 text-slate-900 dark:text-white">Miễn Phí</h2>
                        <p className="text-slate-400 text-sm mt-2">Dành cho người mới bắt đầu</p>
                    </div>

                    <div className="flex-1 space-y-4 mb-10">
                        {features.map((f, i) => (
                            <div key={i} className={`flex items-center gap-3 ${f.free ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-700 line-through'}`}>
                                <div className={`p-1 rounded-full ${f.free ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300'}`}>
                                    {f.free ? <Check size={12} strokeWidth={4} /> : <X size={12} />}
                                </div>
                                <span className="text-sm font-bold">{f.name}</span>
                            </div>
                        ))}
                    </div>

                    <button disabled className="w-full py-4 rounded-3xl font-black text-slate-400 bg-slate-50 dark:bg-slate-800 cursor-not-allowed uppercase tracking-wider">
                        Đang sử dụng
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border-4 border-blue-500/20 rounded-[40px] p-1 shadow-2xl relative h-full">
                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-blue-500/40">
                        Khuyên dùng
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-[36px] p-9 flex flex-col h-full">
                        <div className="mb-8">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Gói Hội Viên</span>
                            <div className="flex items-baseline gap-1 mt-4 text-slate-900 dark:text-white">
                                <span className="text-4xl font-black">{settings.premium_price}</span>
                                <span className="text-sm font-bold text-slate-400">/ Tháng</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-2 italic">* Chỉ bằng một ly cà phê mỗi tuần!</p>
                        </div>

                        <div className="flex-1 space-y-4 mb-10">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-900 dark:text-white">
                                    <div className="p-1 rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/20">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-500">{f.icon}</span>
                                        <span className="text-sm font-black">{f.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowPayment(true)}
                            className="w-full py-5 rounded-3xl font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-lg uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            Kích hoạt PRO ngay <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPayment(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                                    <Wallet className="text-blue-600" /> QUÉT MÃ CHUYỂN KHOẢN
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">Hệ thống sẽ tự động duyệt sau 5-10 phút</p>
                            </div>

                            <div className="flex justify-center bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                                <img
                                    src={qrUrl}
                                    className="w-64 h-64 shadow-xl border-4 border-white rounded-2xl"
                                    alt="Payment QR"
                                />
                            </div>

                            <div className="space-y-4 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800">
                                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                                    <div>
                                        <p className="text-slate-400 uppercase text-[9px] mb-1">Tài khoản</p>
                                        <p className="text-slate-900 dark:text-white uppercase">{settings.bank_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 uppercase text-[9px] mb-1">Số tài khoản</p>
                                        <p className="text-slate-900 dark:text-white">{settings.bank_account}</p>
                                    </div>
                                    <div className="col-span-2 border-t border-blue-100 dark:border-blue-800 pt-3">
                                        <p className="text-slate-400 uppercase text-[9px] mb-1 leading-none">Nội dung chuyển khoản</p>
                                        <p className="text-blue-700 dark:text-blue-400 text-sm font-black mt-1 break-all">
                                            {settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPayment(false)}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs hover:opacity-90 transition-all"
                            >
                                ĐÃ CHUYỂN KHOẢN - ĐÓNG
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
