import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Crown, Check, X, ShieldCheck, Zap, Sparkles, MessageSquare, ImageIcon, Layout, Loader2, ArrowRight, Wallet, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
    const { profile, user } = useAuth();
    const [settings, setSettings] = useState<Record<string, string>>({
        premium_price: '499.000',
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'CHOTSALE [EMAIL]'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'bank' | 'momo' | 'visa'>('bank');

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
            <Loader2 className="animate-spin text-gold" size={32} />
        </div>
    );

    const formatBankName = (name: string) => {
        const clean = name.trim().toUpperCase();
        const map: Record<string, string> = {
            'MB BANK': 'MB',
            'MBBANK': 'MB',
            'VIETCOMBANK': 'VCB',
            'TECHCOMBANK': 'TCB',
            'VIETINBANK': 'CTG',
            'VPBANK': 'VPB',
            'TPBANK': 'TPB',
            'SACOMBANK': 'STB',
            'AGRIBANK': 'VBA'
        };
        return map[clean] || clean.replace(/\s/g, '');
    };

    const qrUrl = `https://img.vietqr.io/image/${formatBankName(settings.bank_name)}-${settings.bank_account}-compact.png?amount=${settings.premium_price.replace(/\./g, '')}&addInfo=${encodeURIComponent(settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH'))}&accountName=${encodeURIComponent(settings.bank_owner)}`;

    return (
        <div className="max-w-6xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-center py-4 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent uppercase italic tracking-tighter">
                    Nâng cấp trải nghiệm <span className="relative">PRO<div className="absolute -top-6 -right-8"><Crown className="text-gold rotate-12 drop-shadow-lg" size={32} fill="currentColor" /></div></span>
                </h1>
                <p className="text-slate-400 font-bold text-sm max-w-2xl mx-auto uppercase tracking-widest mt-2">Sở hữu bộ công cụ AI tối thượng dành riêng cho nhà môi giới BĐS.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto w-full pt-10">
                {/* Free Plan */}
                <div className="bg-[#1a2332] border border-white/5 rounded-[2rem] p-8 flex flex-col hover:border-white/10 transition-all h-full shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="mb-6 relative z-10">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-full inline-block">Gói Cơ Bản</span>
                        <h2 className="text-2xl font-black mt-3 text-white tracking-widest uppercase italic">Miễn Phí</h2>
                    </div>

                    <div className="flex-1 space-y-3 mb-6 relative z-10">
                        {features.map((f, i) => (
                            <div key={i} className={`flex items-center gap-3 ${f.free ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                                <div className={`p-1.5 rounded-full ${f.free ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-700'}`}>
                                    {f.free ? <Check size={10} strokeWidth={4} /> : <X size={10} />}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">{f.name}</span>
                            </div>
                        ))}
                    </div>

                    <button disabled className="w-full py-3.5 rounded-xl font-black text-slate-500 bg-white/5 border border-white/10 cursor-not-allowed uppercase tracking-[0.2em] text-[10px] relative z-10">
                        Đang sử dụng
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-[2rem] p-[2px] shadow-[0_20px_50px_-10px_rgba(191,149,63,0.3)] relative h-full group hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute -top-4 right-8 bg-black border border-gold/50 text-gold font-black text-[10px] uppercase tracking-[0.3em] px-5 py-2 rounded-full shadow-2xl shadow-gold/40 z-30">
                        Khuyên dùng
                    </div>
                    <div className="bg-[#0f172a] rounded-[calc(2rem-2px)] p-7 flex flex-col h-full relative overflow-visible">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] rounded-[calc(2rem-2px)] overflow-hidden"></div>

                        <div className="mb-6 relative z-10">
                            <span className="text-[9px] font-black text-black uppercase tracking-widest bg-gold px-3 py-1.5 rounded-full inline-block shadow-lg">Gói Hội Viên</span>
                            <div className="flex items-baseline gap-1 mt-3 text-white">
                                <span className="text-3xl font-black italic tracking-tighter">
                                    {settings.premium_price.includes('.') ? settings.premium_price : Number(settings.premium_price).toLocaleString('vi-VN')}
                                </span>
                                <span className="text-[10px] font-black text-gold tracking-widest uppercase">/ Tháng</span>
                            </div>
                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-2 border-l-2 border-gold/30 pl-2">Đầu tư sinh lời ngay tháng đầu tiên!</p>
                        </div>

                        <div className="flex-1 space-y-4 mb-6 relative z-10">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-white group/item">
                                    <div className="p-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 group-hover/item:bg-gold group-hover/item:text-black transition-colors">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gold flex items-center justify-center w-4 h-4 opacity-80">{f.icon}</span>
                                        <span className="text-[11px] font-black uppercase tracking-wider">{f.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowPayment(true)}
                            className="w-full py-4 rounded-xl font-black text-black bg-gradient-to-r from-gold to-[#aa771c] shadow-xl shadow-gold/20 hover:shadow-gold/40 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 relative z-10"
                        >
                            Kích hoạt PRO ngay <ArrowRight size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPayment(false)}></div>
                    <div className="relative bg-[#1a2332] w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
                        <div className="p-8 md:p-10 space-y-8">
                            <div className="text-center space-y-4">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center justify-center gap-2">
                                    <Crown className="text-gold" size={24} /> Nâng Cấp Tài Khoản
                                </h3>
                                <p className="block text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mt-2">Lựa chọn Phương thức Thanh Toán</p>
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <button
                                        onClick={() => setSelectedMethod('bank')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMethod === 'bank' ? 'border-gold bg-gold/10 shadow-lg shadow-gold/5' : 'border-white/5 bg-black/20 text-slate-500 opacity-60'}`}
                                    >
                                        <Wallet size={20} className={selectedMethod === 'bank' ? 'text-gold' : 'text-slate-500'} strokeWidth={selectedMethod === 'bank' ? 2.5 : 2} />
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${selectedMethod === 'bank' ? 'text-gold' : ''}`}>VietQR</span>
                                    </button>
                                    <button className="p-4 rounded-xl border-2 border-white/5 bg-black/20 text-slate-500 opacity-40 flex flex-col items-center gap-2 relative">
                                        <div className="w-5 h-5 bg-pink-500/50 rounded-md"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Momo</span>
                                        <span className="text-[7px] text-pink-400 font-bold absolute top-1.5 right-1.5 bg-pink-500/10 px-1 rounded">SOON</span>
                                    </button>
                                    <button className="p-4 rounded-xl border-2 border-white/5 bg-black/20 text-slate-500 opacity-40 flex flex-col items-center gap-2 relative">
                                        <CreditCard size={20} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Visa</span>
                                        <span className="text-[7px] text-blue-400 font-bold absolute top-1.5 right-1.5 bg-blue-500/10 px-1 rounded">SOON</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center bg-black/40 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                                {selectedMethod === 'bank' ? (
                                    <img src={qrUrl} className="w-64 h-64 shadow-[0_0_30px_rgba(191,149,63,0.15)] border-2 border-gold/30 rounded-2xl relative z-10" alt="Payment QR" />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-white/10 rounded-2xl relative z-10">Đang tích hợp...</div>
                                )}
                            </div>

                            <div className="space-y-4 bg-gold/5 p-6 rounded-3xl border border-gold/10">
                                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                                    <div>
                                        <p className="text-slate-500 uppercase text-[8px] tracking-[0.2em] mb-1">Ngân hàng</p>
                                        <p className="text-white uppercase font-black tracking-wider">{settings.bank_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 uppercase text-[8px] tracking-[0.2em] mb-1">Số tài khoản</p>
                                        <p className="text-white font-black tracking-wider text-sm">{settings.bank_account}</p>
                                    </div>
                                    <div className="col-span-2 border-t border-gold/10 pt-4">
                                        <p className="text-slate-500 uppercase text-[8px] tracking-[0.2em] mb-2 leading-none">Nội dung chuyển khoản (Bắt buộc)</p>
                                        <div className="bg-black/30 w-full p-3 rounded-xl border border-white/5 flex items-center justify-between">
                                            <p className="text-gold text-xs font-black tracking-widest font-mono">
                                                {settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH')}
                                            </p>
                                            <div className="text-[8px] text-slate-500 uppercase tracking-widest">Auto Check</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPayment(false)}
                                className="w-full py-4 bg-white/5 text-white border border-white/10 font-black rounded-xl uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={14} className="text-gold" /> TÔI ĐÃ CHUYỂN KHOẢN XONG
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
