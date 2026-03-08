import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Crown, Check, X, ShieldCheck, Zap, Sparkles, MessageSquare, ImageIcon, Layout, Loader2, ArrowRight, Wallet, CreditCard, Coins, TrendingUp, Star, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
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
            price: '25.000',
            bonus: 0,
            description: 'Dành cho người mới bắt đầu trải nghiệm AI chuyên sâu.',
            popular: false,
            color: 'from-slate-400 to-slate-600'
        },
        {
            id: 'growth',
            name: 'Gói Tăng Trưởng',
            credits: 300,
            price: '150.000',
            bonus: 20,
            description: 'Lựa chọn tốt nhất cho môi giới cá nhân chuyên nghiệp.',
            popular: true,
            color: 'from-gold via-white to-gold'
        },
        {
            id: 'elite',
            name: 'Gói Agency/Đội Nhóm',
            credits: 1000,
            price: '500.000',
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
        { name: 'Khởi tạo tài liệu, Namecard số', price: '0', icon: <ImageIcon size={18} /> },
        { name: 'Tra hướng nhà Bát Trạch, Lịch Âm', price: '0', icon: <Layout size={18} /> },
        { name: 'Quân sư tác chiến (Chốt Sale)', price: '2', icon: <MessageSquare size={18} /> },
        { name: 'Máy thiết kế Bài viết AI Đa kênh', price: '10', icon: <Zap size={18} /> },
        { name: 'Kiến tạo phối cảnh AI (Render)', price: '5', icon: <Sparkles size={18} /> },
        { name: 'Phù phép nâng cấp ảnh BĐS', price: '10', icon: <Sparkles size={18} /> },
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
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-start py-6 md:py-8 px-4 space-y-6 md:space-y-8 font-inter">
            {/* Header section with Balance */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#1a2332]/40 p-5 md:p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] -z-10 group-hover:bg-gold/10 transition-all duration-1000"></div>

                <div className="text-center lg:text-left space-y-3 relative flex-1 px-2 md:px-0">
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Ưu đãi kết thúc sau: 05:24:12</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-normal pt-3 pb-2 flex flex-wrap justify-center lg:justify-start items-center gap-x-2 gap-y-1">
                        <span className="bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent pb-1">
                            Nâng cấp trải nghiệm
                        </span>
                        <span className="relative inline-flex items-center text-gold">
                            PRO
                            <Crown className="absolute -top-6 -right-6 md:-top-5 md:-right-8 rotate-[15deg] drop-shadow-[0_0_15px_rgba(191,149,63,0.6)] animate-[bounce_4s_infinite] w-6 h-6 md:w-8 md:h-8 pointer-events-none" fill="currentColor" />
                        </span>
                    </h1>
                    <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] opacity-80 italic border-l-4 border-gold/40 pl-3 py-0.5">Xu cho cỗ máy chốt sale - dùng đến đâu trả tiền đến đó</p>
                </div>

                <div className="flex flex-col items-center shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
                    <div className="bg-black/60 backdrop-blur-xl border border-gold/20 px-6 py-4 rounded-[1.5rem] flex items-center justify-center md:justify-start gap-4 shadow-lg group/balance hover:border-gold/40 transition-all w-full lg:w-auto">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold shadow-inner border border-gold/20 group-hover/balance:scale-110 transition-transform shrink-0">
                            <Coins size={22} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xl md:text-3xl font-black text-white leading-none tracking-tighter">{profile?.credits || 0}</span>
                            <span className="text-[8px] font-black text-gold/60 uppercase tracking-[0.3em] mt-1">Xu hiện có</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credit Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch max-w-7xl mx-auto w-full pt-8 md:pt-12 px-2 md:px-0">
                {creditPackages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`relative rounded-[2rem] md:rounded-[2.5rem] p-[2px] h-full group transition-all duration-700 hover:scale-[1.03] hover:-translate-y-2 ${pkg.popular ? 'bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] shadow-[0_40px_80px_-20px_rgba(191,149,63,0.4)]' : 'bg-white/5 shadow-2xl hover:bg-white/10'}`}
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

                        <div className="bg-[#0b1121] rounded-[calc(2rem-2px)] md:rounded-[calc(2.5rem-2px)] p-6 md:p-8 flex flex-col h-full relative text-center items-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[calc(2rem-2px)] md:rounded-[calc(2.5rem-2px)]"></div>


                            <div className="mb-6 w-full relative">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-8 flex items-center justify-center gap-2 opacity-60">
                                    <Zap size={14} className={pkg.popular ? 'text-gold' : 'text-slate-600'} /> {pkg.name}
                                </h3>

                                <div className="flex flex-col items-center relative">
                                    <div className="absolute -top-4 w-px h-4 bg-gradient-to-b from-gold/40 to-transparent"></div>

                                    <div className="flex items-baseline justify-center gap-1 mb-2">
                                        <span className={`text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent leading-none px-4 block transform-gpu drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}>
                                            {pkg.credits + (pkg.credits * pkg.bonus / 100)}
                                        </span>
                                        <span className="text-base md:text-xl font-black text-slate-600 uppercase tracking-[0.3em] leading-none mb-2">Xu</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tighter">
                                            {pkg.price === '0' ? <span className="text-emerald-400 uppercase tracking-widest text-lg">Miễn phí</span> : `${pkg.price}đ`}
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

                            <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-6 italic opacity-80 max-w-[180px] mx-auto min-h-[40px]">
                                {pkg.description}
                            </p>

                            <div className="flex-1 w-full space-y-3 mb-8">
                                {[
                                    'Mở khóa Elite Studio Premium',
                                    'Dùng AI không giới hạn thời gian',
                                    'Hỗ trợ chiến lược chốt sale AI'
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-center lg:justify-start gap-2 text-white/70 group/item">
                                        <div className="w-3.5 h-3.5 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover/item:bg-gold group-hover/item:text-black transition-all shrink-0">
                                            <Check size={8} strokeWidth={4} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-left">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    if (pkg.isTrial) {
                                        if (!user) navigate('/login');
                                    } else {
                                        handleSelectPackage(pkg);
                                    }
                                }}
                                disabled={pkg.isTrial && !!user}
                                className={`w-full py-4 rounded-xl font-black transition-all text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-2 relative overflow-hidden group/btn shadow-2xl ${pkg.isTrial
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                    : pkg.popular
                                        ? 'bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black hover:shadow-gold/40 hover:brightness-110'
                                        : 'bg-white text-black hover:bg-gold hover:text-white'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 skew-x-[-30deg]"></div>
                                <span>{pkg.isTrial ? (user ? 'Đã nhận quà' : 'Đăng ký tài khoản') : 'Mua Xu ngay'}</span>
                                {pkg.isTrial ? <Gift size={18} /> : <TrendingUp size={18} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Consumption Table */}
            <div className="max-w-4xl mx-auto w-full pt-12 md:pt-20 px-2 md:px-0 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="text-center space-y-3 px-4">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-widest flex items-center justify-center gap-2 md:gap-3">
                        <Gift className="text-gold w-5 h-5 md:w-6 md:h-6" /> Quyền lợi gói free và chi phí
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2 md:px-0">
                    {features.map((f, i) => (
                        <div key={i} className="bg-[#1a2332]/40 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between group hover:border-gold/20 transition-all gap-2">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shrink-0">
                                    {f.icon}
                                </div>
                                <span className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-widest leading-tight">{f.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/40 px-3 md:px-5 py-2 md:py-2.5 rounded-xl border border-white/10 shadow-inner shrink-0 text-center">
                                <span className={`text-[9px] md:text-[11px] font-black ${f.price === '0' ? 'text-green-400' : 'text-gold'} uppercase tracking-tighter whitespace-nowrap`}>
                                    {f.price === '0' ? 'Free Access' : `${f.price} Xu / Lượt`}
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
                    <div className="relative bg-[#1a2332] w-full max-w-[440px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                        <div className="overflow-y-auto no-scrollbar p-5 md:p-6 space-y-4 md:space-y-5">
                            <div className="text-center space-y-3">
                                <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-gold/20 shadow-xl">
                                    <TrendingUp className="text-gold" size={24} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">Nạp Năng Lượng Sale</h3>
                                <div className="bg-black/40 px-4 py-2.5 rounded-xl border border-white/5 inline-block">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Thanh toán gói {selectedPackage?.name}</p>
                                    <p className="text-lg font-black text-gold">{selectedPackage?.price} VNĐ</p>
                                </div>
                            </div>

                            <div className="flex justify-center bg-black/60 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 relative overflow-hidden group shadow-inner">
                                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl"></div>
                                {selectedMethod === 'bank' ? (
                                    <img src={qrUrl} className="w-44 h-44 md:w-52 md:h-52 shadow-[0_0_50px_rgba(191,149,63,0.3)] border-[3px] border-gold/30 rounded-[1.25rem] md:rounded-3xl relative z-10 hover:scale-105 transition-transform duration-500" alt="Payment QR" />
                                ) : (
                                    <div className="w-52 h-52 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-white/10 rounded-3xl relative z-10">Đang tích hợp...</div>
                                )}
                            </div>

                            <div className="space-y-3 bg-gold/5 p-4 md:p-5 rounded-[1.25rem] border border-gold/10">
                                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                                    <div>
                                        <p className="text-slate-500 uppercase text-[8px] tracking-[0.3em] mb-1.5">Chủ tài khoản</p>
                                        <p className="text-white uppercase text-[9px] font-black tracking-wide bg-white/5 p-2 rounded-lg border border-white/5 leading-none">{settings.bank_owner}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 uppercase text-[8px] tracking-[0.3em] mb-1.5">Số tài khoản</p>
                                        <p className="text-gold font-black tracking-widest text-sm bg-black/40 p-2 rounded-lg border border-gold/20 leading-none">{settings.bank_account}</p>
                                    </div>
                                    <div className="col-span-2 border-t border-gold/10 pt-3 md:pt-4">
                                        <p className="text-slate-500 uppercase text-[8px] tracking-[0.3em] mb-2 leading-none italic">Nội dung bắt buộc (để nạp auto)</p>
                                        <div className="bg-black/60 w-full p-2.5 rounded-xl border border-gold/40 flex items-center justify-between group cursor-pointer hover:bg-black/80 transition-all">
                                            <p className="text-gold text-sm font-black tracking-[0.2em] font-mono whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                                                {settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH')}
                                            </p>
                                            <div className="text-[8px] text-white/40 uppercase tracking-widest border border-white/10 px-2 py-1.5 rounded-md group-hover:text-gold group-hover:border-gold transition-all shrink-0">Copy</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="w-full py-3.5 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black font-black rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group/btn"
                                >
                                    <Check size={16} strokeWidth={4} /> TÔI ĐÃ CHUYỂN KHOẢN XONG
                                </button>
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="w-full py-2.5 text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors"
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
