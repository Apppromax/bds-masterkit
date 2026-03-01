import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Crown, Check, X, ShieldCheck, Zap, Sparkles, MessageSquare, ImageIcon, Layout, Loader2, ArrowRight, Wallet, CreditCard, Coins, TrendingUp, Star, Gift } from 'lucide-react';
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
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

    const creditPackages = [
        {
            id: 'trial',
            name: 'Gói Dùng Thử',
            credits: 25,
            price: '0',
            bonus: 0,
            description: 'Quà tặng chào mừng cho tài khoản mới. Trải nghiệm đầy đủ tính năng.',
            popular: false,
            color: 'from-emerald-400 to-teal-600',
            isTrial: true
        },
        {
            id: 'starter',
            name: 'Gói Khởi Đầu',
            credits: 50,
            price: '99.000',
            bonus: 0,
            description: 'Dành cho người mới bắt đầu trải nghiệm AI chuyên sâu.',
            popular: false,
            color: 'from-slate-400 to-slate-600'
        },
        {
            id: 'growth',
            name: 'Gói Tăng Trưởng',
            credits: 300,
            price: '499.000',
            bonus: 20,
            description: 'Lựa chọn tốt nhất cho môi giới cá nhân chuyên nghiệp.',
            popular: true,
            color: 'from-gold via-white to-gold'
        },
        {
            id: 'elite',
            name: 'Gói Agency/Đội Nhóm',
            credits: 1000,
            price: '1.490.000',
            bonus: 50,
            description: 'Sức mạnh tối đa cho đội nhóm từ 5-10 người.',
            popular: false,
            color: 'from-amber-400 to-amber-600'
        }
    ];

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
        { name: 'Image Studio cơ bản', price: '0', icon: <ImageIcon size={18} /> },
        { name: 'Tạo quảng cáo mẫu', price: '0', icon: <Layout size={18} /> },
        { name: 'Tra hướng nhà Bát Trạch', price: '0', icon: <Layout size={18} /> },
        { name: 'AI Image Studio (Premium Templates)', price: '1', icon: <Sparkles size={18} /> },
        { name: 'Tạo nội dung AI Đa kênh (FB, Zalo, Tiktok)', price: '2', icon: <MessageSquare size={18} /> },
        { name: 'Thầy Phong Thủy AI (Tư vấn chuyên sâu)', price: '5', icon: <Zap size={18} /> },
        { name: 'Gỡ bỏ Watermark hệ thống', price: '1', icon: <ShieldCheck size={18} /> },
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-gold" size={32} />
        </div>
    );

    const handleSelectPackage = (pkg: any) => {
        setSelectedPackage(pkg);
        setShowPayment(true);
    };

    const formatBankName = (name: string) => {
        const clean = name ? name.trim().toUpperCase() : '';
        if (!clean) return '';
        const map: Record<string, string> = {
            'MB BANK': 'MB', 'MBBANK': 'MB', 'VIETCOMBANK': 'VCB', 'TECHCOMBANK': 'TCB',
            'VIETINBANK': 'CTG', 'VPBANK': 'VPB', 'TPBANK': 'TPB', 'SACOMBANK': 'STB', 'AGRIBANK': 'VBA'
        };
        return map[clean] || clean.replace(/\s/g, '');
    };

    const currentPrice = selectedPackage ? selectedPackage.price : settings.premium_price;
    const qrUrl = `https://img.vietqr.io/image/${formatBankName(settings.bank_name)}-${settings.bank_account}-compact.png?amount=${currentPrice.replace(/\./g, '')}&addInfo=${encodeURIComponent(settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH'))}&accountName=${encodeURIComponent(settings.bank_owner)}`;

    return (
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-start py-6 md:py-8 px-4 space-y-8 md:space-y-12 font-inter">
            {/* Header section with Balance */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#1a2332]/40 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] -z-10 group-hover:bg-gold/10 transition-all duration-1000"></div>

                <div className="text-center lg:text-left space-y-4 relative max-w-2xl px-2 md:px-0">
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1 rounded-full mb-4">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Ưu đãi kết thúc sau: 05:24:12</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent uppercase italic tracking-tighter leading-[1.1] md:leading-[1.1] py-2">
                        Nâng cấp <br className="hidden md:block" /> trải nghiệm <span className="relative inline-block ml-2 md:ml-6 whitespace-nowrap">
                            PRO
                            <Crown className="absolute -top-6 md:-top-10 -right-8 md:-right-12 text-gold rotate-[15deg] drop-shadow-[0_0_15px_rgba(191,149,63,0.6)] animate-[bounce_4s_infinite] w-8 h-8 md:w-14 md:h-14 pointer-events-none" fill="currentColor" />
                        </span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-[0.4em] opacity-70 italic border-l-4 border-gold/40 pl-4 py-1">Xu cho cỗ máy chốt sale - dùng đến đâu trả tiền đến đó</p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="bg-black/60 backdrop-blur-2xl border-2 border-gold/20 p-6 rounded-3xl flex flex-col items-center gap-4 min-w-[240px] shadow-[0_20px_50px_rgba(191,149,63,0.15)] group/balance hover:border-gold/40 transition-all duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold shadow-inner border border-gold/20 group-hover/balance:scale-110 transition-transform">
                                <Coins size={28} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter">{profile?.credits || 0}</span>
                                <span className="text-[8px] md:text-[9px] font-black text-gold/60 uppercase tracking-[0.3em] mt-1">Xu chốt sale</span>
                            </div>
                        </div>
                        <button className="w-full py-2.5 rounded-xl bg-gold/5 border border-gold/20 text-[9px] font-black text-gold uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-2">
                            Quản lý ví <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Credit Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch max-w-6xl mx-auto w-full pt-16 px-4">
                {creditPackages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`relative rounded-[2.5rem] md:rounded-[3.5rem] p-[2px] h-full group transition-all duration-700 hover:scale-[1.03] hover:-translate-y-2 ${pkg.popular ? 'bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] shadow-[0_40px_80px_-20px_rgba(191,149,63,0.4)]' : 'bg-white/5 shadow-2xl hover:bg-white/10'}`}
                    >
                        {pkg.popular && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gold blur-xl opacity-20"></div>
                                    <div className="relative bg-black border border-gold/50 px-8 py-2.5 rounded-full flex items-center gap-3 shadow-[0_10px_30px_rgba(191,149,63,0.3)]">
                                        <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.4em] whitespace-nowrap">HỢP LÝ NHẤT</span>
                                        <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-[#0b1121] rounded-[calc(2.5rem-2px)] md:rounded-[calc(3.5rem-2px)] p-8 md:p-12 flex flex-col h-full relative text-center items-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[calc(2.5rem-2px)] md:rounded-[calc(3.5rem-2px)]"></div>


                            <div className="mb-10 w-full relative">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-8 flex items-center justify-center gap-2 opacity-60">
                                    <Zap size={14} className={pkg.popular ? 'text-gold' : 'text-slate-600'} /> {pkg.name}
                                </h3>

                                <div className="flex flex-col items-center relative">
                                    <div className="absolute -top-4 w-px h-4 bg-gradient-to-b from-gold/40 to-transparent"></div>

                                    <div className="flex items-baseline justify-center gap-2 mb-2">
                                        <span className={`text-6xl md:text-8xl font-black italic tracking-tighter bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent leading-none px-6 md:px-10 block transform-gpu drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}>
                                            {pkg.credits + (pkg.credits * pkg.bonus / 100)}
                                        </span>
                                        <span className="text-base md:text-xl font-black text-slate-600 uppercase tracking-[0.3em] leading-none mb-2">Xu</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                                            {pkg.price === '0' ? <span className="text-emerald-400 uppercase">Miễn phí</span> : `${pkg.price}đ`}
                                        </p>
                                        {!pkg.isTrial && (
                                            <div className="flex items-center gap-2 opacity-70">
                                                <span className="w-1 h-1 bg-gold/40 rounded-full"></span>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] italic">Gốc: {pkg.price} VNĐ</p>
                                                <span className="w-1 h-1 bg-gold/40 rounded-full"></span>
                                            </div>
                                        )}
                                        {/* Bonus Indicator - Moved here */}
                                        {pkg.bonus > 0 && (
                                            <div className="mt-4">
                                                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-1.5 rounded-full">
                                                    <Gift size={12} className="text-gold" />
                                                    <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">+{pkg.bonus}% Bonus Included</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-10 italic opacity-80 max-w-[220px] mx-auto">
                                {pkg.description}
                            </p>

                            <div className="flex-1 w-full space-y-4 mb-10">
                                {[
                                    'Mở khóa Elite Studio Premium',
                                    'Dùng AI không giới hạn thời gian',
                                    'Hỗ trợ chiến lược chốt sale AI'
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-center gap-3 text-white/70 group/item">
                                        <div className="w-4 h-4 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover/item:bg-gold group-hover/item:text-black transition-all">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => !pkg.isTrial && handleSelectPackage(pkg)}
                                disabled={pkg.isTrial && !!user}
                                className={`w-full py-6 rounded-2xl font-black transition-all text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 relative overflow-hidden group/btn shadow-2xl ${pkg.isTrial
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                    : pkg.popular
                                        ? 'bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black hover:shadow-gold/40 hover:brightness-110'
                                        : 'bg-white text-black hover:bg-gold hover:text-white'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 skew-x-[-30deg]"></div>
                                <span>{pkg.isTrial ? (user ? 'Đã nhận quà' : 'Đăng ký để nhận') : 'Mua Xu ngay'}</span>
                                {pkg.isTrial ? <Gift size={18} /> : <TrendingUp size={18} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Consumption Table */}
            <div className="max-w-4xl mx-auto w-full pt-20 space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center justify-center gap-3">
                        <Gift className="text-gold" /> Định mức tiêu dùng AI
                    </h2>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">Minh bạch từng lượt sử dụng cho cỗ máy của bạn</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <div key={i} className="bg-[#1a2332]/40 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-gold/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{f.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/40 px-5 py-2.5 rounded-xl border border-white/10 shadow-inner">
                                <span className={`text-[11px] font-black ${f.price === '0' ? 'text-green-400' : 'text-gold'} uppercase tracking-tighter`}>
                                    {f.price === '0' ? 'Free Access' : `${f.price} Credits / Lượt`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPayment(false)}></div>
                    <div className="relative bg-[#1a2332] w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                        <div className="overflow-y-auto no-scrollbar p-6 md:p-12 space-y-6 md:space-y-8">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20 shadow-2xl">
                                    <TrendingUp className="text-gold" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Nạp Năng Lượng Sale</h3>
                                <div className="bg-black/40 px-6 py-4 rounded-2xl border border-white/5 inline-block">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Thanh toán cho {selectedPackage?.name}</p>
                                    <p className="text-xl font-black text-gold">{selectedPackage?.price} VNĐ</p>
                                </div>
                            </div>

                            <div className="flex justify-center bg-black/60 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-inner">
                                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl"></div>
                                {selectedMethod === 'bank' ? (
                                    <img src={qrUrl} className="w-48 h-48 md:w-64 md:h-64 shadow-[0_0_50px_rgba(191,149,63,0.3)] border-4 border-gold/30 rounded-2xl md:rounded-3xl relative z-10 hover:scale-105 transition-transform duration-500" alt="Payment QR" />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-white/10 rounded-3xl relative z-10">Đang tích hợp...</div>
                                )}
                            </div>

                            <div className="space-y-4 bg-gold/5 p-6 md:p-8 rounded-[2rem] border border-gold/10">
                                <div className="grid grid-cols-2 gap-6 text-xs font-bold">
                                    <div>
                                        <p className="text-slate-500 uppercase text-[9px] tracking-[0.3em] mb-2">Chủ tài khoản</p>
                                        <p className="text-white uppercase font-black tracking-wide bg-white/5 p-3 rounded-xl border border-white/5 leading-none">{settings.bank_owner}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 uppercase text-[9px] tracking-[0.3em] mb-2">Số tài khoản</p>
                                        <p className="text-gold font-black tracking-widest text-lg bg-black/40 p-2.5 rounded-xl border border-gold/20 leading-none">{settings.bank_account}</p>
                                    </div>
                                    <div className="col-span-2 border-t border-gold/10 pt-4 md:pt-6">
                                        <p className="text-slate-500 uppercase text-[9px] tracking-[0.3em] mb-3 leading-none italic">Nội dung bắt buộc (để nạp credit tự động)</p>
                                        <div className="bg-black/60 w-full p-4 rounded-xl md:rounded-2xl border border-gold/40 flex items-center justify-between group cursor-pointer hover:bg-black/80 transition-all">
                                            <p className="text-gold text-base md:text-lg font-black tracking-[0.2em] font-mono whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                                                {settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH')}
                                            </p>
                                            <div className="text-[9px] text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-lg group-hover:text-gold group-hover:border-gold transition-all">Copy</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="w-full py-5 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black font-black rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 group/btn"
                                >
                                    <Check size={18} strokeWidth={4} /> TÔI ĐÃ CHUYỂN KHOẢN XONG
                                </button>
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="w-full py-4 text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                                >
                                    Hủy giao dịch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
